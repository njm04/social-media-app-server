import mongoose, { Document } from "mongoose";
import Joi, { ValidationResult } from "joi";

const Schema = mongoose.Schema;

export interface ICommentCount extends Document {
  postId: mongoose.Types.ObjectId;
  count: number;
}

const commentCountSchema = new Schema({
  postId: { type: mongoose.Types.ObjectId, required: true },
  count: { type: Number, required: true, default: 0 },
});

export const validate = (comment: object): ValidationResult => {
  const schema: Joi.ObjectSchema<ICommentCount> = Joi.object({
    postId: Joi.string().required(),
    count: Joi.number().required(),
  });

  return schema.validate(comment);
};

export default mongoose.model<ICommentCount>(
  "CommentCount",
  commentCountSchema
);
