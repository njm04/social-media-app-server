import { Router, Request, Response } from "express";
import Image, { validate } from "../models/image";
import auth from "../middlewares/auth";
import validateObjectId from "../middlewares/validateObjectId";
import User from "../models/user";

const router: Router = Router();

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

// prepared for future use.
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

// router.post("/", auth, async (req: Request, res: Response) => {
//   const images = await Image.findById(req.body.postImagesId).select(
//     "-__v -imageData._id"
//   );

//   res.send(images);
// });

router.get("/", auth, async (req: Request, res: Response) => {
  const images = await Image.find({}).select("-__v -imageData._id");
  res.send(images);
});

export = router;
