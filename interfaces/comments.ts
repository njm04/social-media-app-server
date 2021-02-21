import mongoose, { Document } from "mongoose";

interface ICreatedBy {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  fullName: string;
}

export interface IComment extends Document {
  post: mongoose.Types.ObjectId;
  comment: string;
  createdBy: ICreatedBy;
}

export interface IReceivedComment {
  post: mongoose.Types.ObjectId;
  comment: string;
  userId: mongoose.Types.ObjectId;
}
