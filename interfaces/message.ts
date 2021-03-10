import mongoose, { Document } from "mongoose";

export interface IMessage extends Document {
  message: string;
  sentBy: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
}
