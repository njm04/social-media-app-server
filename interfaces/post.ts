import mongoose, { Document } from "mongoose";

export interface IPostedBy {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  fullName: string;
}

export interface IPost extends Document {
  post: string;
  postedBy: IPostedBy; // string type also works
  likes: number;
  postImages: object[];
}
