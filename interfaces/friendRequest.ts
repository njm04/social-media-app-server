import mongoose, { Document } from "mongoose";

export interface IFriendRequest extends Document {
  requester: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  status: string;
}
