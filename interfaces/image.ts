import mongoose, { Document } from "mongoose";

export interface IUploadImage extends Document {
  name: string;
  data: string;
  postId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
}
