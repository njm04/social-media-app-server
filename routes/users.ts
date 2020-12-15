import express, { Router, Request, Response } from "express";
import _ from "lodash";
import bcrypt from "bcryptjs";
import User, { IUser, validate } from "../models/user";
import auth from "../middlewares/auth";

const router: Router = express.Router();

router.get("/me", auth, async (req: Request, res: Response) => {
  const user = await User.findById((req as any).user._id).select("-password");
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
  } catch (error: any) {
    console.log(error);
    res.status(500).send("Unexpected error occured");
  }
});

export = router;
