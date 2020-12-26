import { Router, Request, Response } from "express";
import Image from "../models/image";
import auth from "../middlewares/auth";

const router: Router = Router();

/*
  upload image in base64 format, thereby,
  directly storing it in mongodb
*/
router.post("/uploadbase", auth, async (req: Request, res: Response) => {
  try {
    const newImage = new Image({
      name: req.body.name,
      data: req.body.data,
    });
    await newImage.save();
    res.send(newImage);
  } catch (error) {
    console.log(error);
    res.status(500).send("Unexpected error occured");
  }
});

router.post("/", auth, async (req: Request, res: Response) => {
  const images = await Image.findById(req.body.postImagesId).select(
    "-__v -imageData._id"
  );

  res.send(images);
});

router.get("/", auth, async (req: Request, res: Response) => {
  const images = await Image.find({}).select("-__v -imageData._id");
  res.send(images);
});

export = router;
