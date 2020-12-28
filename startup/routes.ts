import express, { Application } from "express";
import cors from "cors";
import users from "../routes/users";
import auth from "../routes/auth";
import posts from "../routes/posts";
import comments from "../routes/comments";
import friends from "../routes/friends";
import images from "../routes/images";
import likes from "../routes/likes";

const corsOptions = {
  exposedHeaders: "x-auth-token",
};

module.exports = (app: Application): void => {
  app.use(express.json());
  app.use(cors(corsOptions));
  app.use("/api/auth", auth);
  app.use("/api/users", users);
  app.use("/api/posts", posts);
  app.use("/api/comments", comments);
  app.use("/api/friends", friends);
  app.use("/api/images", images);
  app.use("/api/likes", likes);
};
