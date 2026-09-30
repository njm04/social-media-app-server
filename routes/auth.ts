import { Router, Request, Response } from "express";
import Joi, { ValidationResult } from "joi";
import User from "../models/user";
import { IUser } from "../interfaces/user";
import mongoose from "mongoose";
import rateLimit from "../middlewares/rateLimit";

const router: Router = Router();

const validateLogin = (data: object): ValidationResult => {
  const schema: Joi.ObjectSchema = Joi.object({
    email: Joi.string().min(5).max(255).email().required(),
    password: Joi.string().min(5).max(1000).required(),
  });

  return schema.validate(data);
};

router.post("/", rateLimit, async (req: Request, res: Response) => {
  const { error } = validateLogin(req.body);
  if (error) return res.status(400).send(error.details[0].message);

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
    new mongoose.Types.ObjectId(req.params.userId)
  );
  if (!user) return res.status(400).send("Invalid user");
  res.send({});
});

export = router;
