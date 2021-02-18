import express, { Router, Request, Response } from "express";
import _ from "lodash";
import bcrypt from "bcryptjs";
import User, { IUser } from "../models/user";
import auth from "../middlewares/auth";

const router: Router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  const user: IUser | null = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid password or email");

  const validPassword: boolean = await bcrypt.compare(
    req.body.password,
    user.password
  );
  if (!validPassword) return res.status(400).send("Invalid password or email");

  const token = user.generateAuthToken();
  res.send(token);

  await User.findByIdAndUpdate(user._id, { status: "active" });
});

router.patch("/logout/:userId", async (req: Request, res: Response) => {
  const user: IUser | null = await User.findByIdAndUpdate(req.params.userId, {
    status: "offline",
  });
  if (!user) return res.status(400).send("Invalid user");

  res.send({});
});

export = router;
