import express, { Router, Request, Response } from "express";
import mongoose from "mongoose";
import _ from "lodash";
import bcrypt from "bcryptjs";
import User, { validate } from "../models/user";
import { IUser } from "../interfaces/user";
import Image from "../models/image";
import auth from "../middlewares/auth";
import validateObjectId from "../middlewares/validateObjectId";

const router: Router = express.Router();

router.get("/me", auth, async (req: Request, res: Response) => {
  const user: IUser | null = await User.findById((req as any).user._id).select(
    "-password"
  );
  res.send(user);
});

router.post("/register", async (req: Request, res: Response) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user: IUser | null = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already exists");

  try {
    user = new User(
      _.pick(req.body, [
        "firstName",
        "lastName",
        "email",
        "birthDate",
        "gender",
        "password",
        "status",
        "contactNumber",
        "address",
        "addressTwo?",
        "state",
        "city",
        "zip",
      ])
    );

    user.password = await bcrypt.hash(user.password, 10);
    await user.save();
    res.send(user);
  } catch (error) {
    console.log(error);
    res.status(500).send("Unexpected error occured");
  }
});

router.patch(
  "/update-profile-picture/:id",
  [auth, validateObjectId],
  async (req: Request, res: Response) => {
    const id = mongoose.Types.ObjectId(req.params.id);
    const user = await User.findByIdAndUpdatePhoto(
      id,
      req.body.name,
      req.body.url,
      "profile-picture"
    );
    if (!user) return res.status(400).send("Invalid user");

    try {
      const image = new Image({
        imageData: user.profilePicture,
        userId: user._id,
      });

      await image.save();
    } catch (error) {
      console.log(error);
      res.status(500).send("Unexpected error occured");
    }

    res.send(user);
  }
);

router.patch(
  "/update-cover-photo/:id",
  [auth, validateObjectId],
  async (req: Request, res: Response) => {
    const id = mongoose.Types.ObjectId(req.params.id);
    const user = await User.findByIdAndUpdatePhoto(
      id,
      req.body.name,
      req.body.url,
      "cover-photo"
    );
    if (!user) return res.status(400).send("Invalid user");

    try {
      const image = new Image({
        imageData: user.coverPhoto,
        userId: user._id,
      });

      await image.save();
    } catch (error) {
      console.log(error);
      res.status(500).send("Unexpected error occured");
    }

    res.send(user);
  }
);

router.get(
  "/search/:searchQuery?",
  auth,
  async (req: Request, res: Response) => {
    if (!req.params.searchQuery) return res.send([]);

    const user = await User.findBySearchQuery(req.params.searchQuery);
    if (user.length < 0) return res.send([]);

    res.send(user);
  }
);

router.get("/", auth, async (req: Request, res: Response) => {
  res.send(await User.findAllUsers());
});

export = router;
