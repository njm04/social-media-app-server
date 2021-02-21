import mongoose, { Document, Model } from "mongoose";
import Joi, { ValidationResult } from "joi";
import { ILike } from "../interfaces/like";

interface ILikeModel extends Model<ILike> {
  findOneLikeByPostIdAndUserId: (
    postId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId
  ) => Promise<ILike>;
  deleteOneLike: (
    postId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId
  ) => Promise<any>;
  deletePostLikes: (postId: mongoose.Types.ObjectId) => Promise<any>;
  createLike: (
    userId: mongoose.Types.ObjectId,
    postId: mongoose.Types.ObjectId
  ) => ILike;
  findAllLikes: () => Promise<ILike[]>;
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

likeSchema.statics.findOneLikeByPostIdAndUserId = async function (
  postId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId
): Promise<ILike> {
  return await this.findOne({ postId, userId });
};

likeSchema.statics.deleteOneLike = async function (
  postId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId
): Promise<ILike> {
  return await this.deleteOne({ postId, userId });
};

likeSchema.statics.deletePostLikes = async function (
  postId: mongoose.Types.ObjectId
): Promise<ILike> {
  return await this.deleteMany({ postId });
};

likeSchema.statics.createLike = function (
  userId: mongoose.Types.ObjectId,
  postId: mongoose.Types.ObjectId
): ILike {
  const like = new LikeModel({
    userId,
    postId,
    likesCount: 1,
  });

  return like;
};

likeSchema.statics.findAllLikes = async function name(): Promise<ILike[]> {
  return await this.find({}).select("-__v");
};

export const validate = (post: object): ValidationResult => {
  const schema: Joi.ObjectSchema<ILike> = Joi.object({
    postId: Joi.string().required(),
    userId: Joi.string().required(),
  });

  return schema.validate(post);
};

const LikeModel: ILikeModel = mongoose.model<ILike, ILikeModel>(
  "Like",
  likeSchema
);
export default LikeModel;
