import express, { Router, Request, Response } from "express";
import User from "../models/user";
import { IUser } from "../interfaces/user";
import mongoose from "mongoose";

const router: Router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  const user: IUser = await User.findOneByEmail(req.body.email);
  if (!user) return res.status(400).send("Invalid password or email");

  const valid = await user.validatePassword(user.password, req.body.password);
  if (!valid) return res.status(400).send("Invalid password or email");
  await User.findByIdAndUpdateStatusToActive(user._id);
  const token = await user.generateAuthToken();
  res.send(token);
});

router.patch("/logout/:userId", async (req: Request, res: Response) => {
  const user: IUser = await User.findByIdAndUpdateStatusToOffline(
    mongoose.Types.ObjectId(req.params.userId)
  );
  if (!user) return res.status(400).send("Invalid user");
  res.send({});
});

export = router;
