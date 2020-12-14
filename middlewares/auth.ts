import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "config";

export default (req: Request, res: Response, next: NextFunction) => {
  const token: string | undefined = req.header("x-auth-token");
  if (!token) return res.status(401).send("Access denied. No token provided.");

  try {
    const decoded: string | object = jwt.verify(
      token,
      config.get("jwtPrivateKey")
    );
    // TODO: figure out how to create a new value within req without using type any
    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(400).send("Invalid token");
  }
};
