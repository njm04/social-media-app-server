import express, { Application } from "express";
import users from "../routes/users";
import auth from "../routes/auth";

module.exports = (app: Application): void => {
  app.use(express.json());
  app.use("/api/auth", auth);
  app.use("/api/users", users);
};
