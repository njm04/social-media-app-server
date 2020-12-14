import mongoose from "mongoose";
import { Request, Response, NextFunction } from "express";

export default (req: Request, res: Response, next: NextFunction) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(404).send("Invalid id");

  next();
};
