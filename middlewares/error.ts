import { Request, Response, NextFunction } from "express";
import winston from "winston";

// Final error handler: log full detail server-side, never leak internals to clients.
export default (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  winston.error(err.message, { error: err });
  res.status(500).send("Something failed. Please try again later.");
};
