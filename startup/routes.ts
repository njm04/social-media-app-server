import express, { Application } from "express";
import users from "../routes/users";
import auth from "../routes/auth";
import posts from "../routes/posts";
import comments from "../routes/comments";

module.exports = (app: Application): void => {
  app.use(express.json());
  app.use("/api/auth", auth);
  app.use("/api/users", users);
  app.use("/api/posts", posts);
  app.use("/api/comments", comments);
};
