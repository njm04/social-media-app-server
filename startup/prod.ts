import { Application } from "express";
import helmet from "helmet";
import compression from "compression";

module.exports = (app: Application) => {
  app.use(helmet());
  app.use(compression());
};
