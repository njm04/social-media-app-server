import mongoose, { Document } from "mongoose";
import Joi, { ValidationResult } from "joi";

interface IPostedBy {
  _id: string;
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

const Schema = mongoose.Schema;

const postSchema: mongoose.Schema<IPost> = new Schema(
  {
    post: { type: String, default: "" },
    postedBy: {
      type: new Schema({
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        fullName: { type: String, required: true },
      }),
    },
    likes: { type: Number, default: 0 },
    postImages: { type: Array },
  },
  { timestamps: true }
);

export const validate = (post: object): ValidationResult => {
  const schema: Joi.ObjectSchema<IPost> = Joi.object({
    post: Joi.string().required().allow(""),
    postedBy: Joi.string().required(),
  });

  return schema.validate(post);
};

export default mongoose.model<IPost>("Post", postSchema);
