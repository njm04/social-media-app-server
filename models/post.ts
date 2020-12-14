import mongoose, { Document } from "mongoose";
import Joi, { ValidationResult } from "joi";

export interface IPost extends Document {
  post: string;
  postedBy: string;
}

const Schema = mongoose.Schema;

const postSchema: mongoose.Schema<IPost> = new Schema({
  post: { type: String, required: true },
  postedBy: { type: Schema.Types.ObjectId, ref: "User" },
});

export const validate = (post: object): ValidationResult => {
  const schema: Joi.ObjectSchema<IPost> = Joi.object({
    post: Joi.string().required(),
    postedBy: Joi.string().required(),
  });

  return schema.validate(post);
};

export default mongoose.model<IPost>("Post", postSchema);
