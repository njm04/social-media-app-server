import mongoose, { Document } from "mongoose";

export interface ICommentCount extends Document {
  postId: mongoose.Types.ObjectId;
  count: number;
}
