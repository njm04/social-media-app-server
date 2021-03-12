import express, { Application } from "express";
import winston, { Logger } from "winston";

const app: Application = express();
require("./startup/logging")();
require("./startup/routes")(app);
require("./startup/db")();
require("./startup/config")();
require("./startup/prod")(app);

const PORT: string | number = process.env.PORT || 3001;
const server: object = app.listen(
  PORT,
  (): Logger => winston.info(`Server is running on port: ${PORT}`)
  //console.log(`Server is running on port: ${PORT}`)
);

module.exports = server;
