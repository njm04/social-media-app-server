import mongoose, { Document, Model } from "mongoose";
import Joi, { ValidationResult } from "joi";
import { ICommentCount } from "../interfaces/commentCount";

interface ICommentCountModel extends Model<ICommentCount> {
  findOneCommentCount: (
    postId: mongoose.Types.ObjectId
  ) => Promise<ICommentCount>;
  saveCommentCount: (postId: mongoose.Types.ObjectId) => Promise<void>;
  findOneCommentCountAndIncrement: (
    postId: mongoose.Types.ObjectId
  ) => Promise<void>;
  findOneCommentCountAndDecrement: (
    commentId: mongoose.Types.ObjectId
  ) => Promise<void>;
}

const Schema = mongoose.Schema;

const commentCountSchema = new Schema({
  postId: { type: mongoose.Types.ObjectId, required: true },
  count: { type: Number, required: true, default: 0 },
});

commentCountSchema.statics.findOneCommentCount = async function (
  postId: mongoose.Types.ObjectId
): Promise<ICommentCount> {
  return await this.findOne({ postId });
};

commentCountSchema.statics.saveCommentCount = async function (
  postId: mongoose.Types.ObjectId
): Promise<void> {
  const count = new CommentCountModel({
    postId,
  });
  count.count += 1;
  await count.save();
};

commentCountSchema.statics.findOneCommentCountAndIncrement = async function (
  postId: mongoose.Types.ObjectId
): Promise<void> {
  await this.updateOne({ postId }, { $inc: { count: 1 } });
};

// delete commentCount if count is 0 else decrement
commentCountSchema.statics.findOneCommentCountAndDecrement = async function (
  postId: mongoose.Types.ObjectId
): Promise<void> {
  const options = { new: true };
  const commentCount = await this.findOneAndUpdate(
    { postId },
    { $inc: { count: -1 } },
    options
  );

  if (commentCount.count === 0) await this.deleteOne({ postId });
};

export const validate = (comment: object): ValidationResult => {
  const schema: Joi.ObjectSchema<ICommentCount> = Joi.object({
    postId: Joi.string().required(),
    count: Joi.number().required(),
  });

  return schema.validate(comment);
};

const CommentCountModel: ICommentCountModel = mongoose.model<
  ICommentCount,
  ICommentCountModel
>("CommentCount", commentCountSchema);
export default CommentCountModel;
