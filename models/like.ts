import mongoose, { Document } from "mongoose";
import Joi, { ValidationResult } from "joi";

interface ILike extends Document {
  postId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  likesCount: number;
}

const Schema = mongoose.Schema;

const likeSchema = new Schema(
  {
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    likesCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export const validate = (post: object): ValidationResult => {
  const schema: Joi.ObjectSchema<ILike> = Joi.object({
    postId: Joi.string().required(),
    userId: Joi.string().required(),
  });

  return schema.validate(post);
};

export default mongoose.model<ILike>("Like", likeSchema);
