import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import Image, { validate } from "../models/image";
import auth from "../middlewares/auth";
import validateObjectId from "../middlewares/validateObjectId";
import User from "../models/user";

const router: Router = Router();

// this route has not been used from the frontend
router.post("/", [auth], async (req: Request, res: Response) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findById(req.body.userId);
  if (!user) return res.status(400).send("Invalid user");

  try {
    const image = new Image({
      imageData: req.body.imageData,
      userId: user._id,
    });

    await image.save();
    res.send(image);
  } catch (error) {
    console.log(error);
    res.status(500).send("Unexpected error occured");
  }
});

// this route has not been used from the frontend
router.patch(
  "/:id",
  [auth, validateObjectId],
  async (req: Request, res: Response) => {
    const options = { new: true };
    const image = await Image.findByIdAndUpdate(
      req.params.id,
      { imageData: req.body.imageData },
      options
    );

    if (!image) return res.status(400).send("Image not found");

    res.send(image);
  }
);

router.get("/", auth, async (req: Request, res: Response) => {
  const images = await Image.findAllImages();
  res.send(images);
});

router.delete("/:postId", auth, async (req: Request, res: Response) => {
  const image = await Image.findOneImageDataAndDelete(
    mongoose.Types.ObjectId(req.params.postId)
  );
  if (!image) return res.status(400).send("Unable to delete");
  res.send(image);
});

export = router;
