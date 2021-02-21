import mongoose, { Document, Model } from "mongoose";
import { pick } from "lodash";
import Joi, { ValidationResult } from "joi";
import { IComment, IReceivedComment } from "../interfaces/comments";
import { IUser } from "../interfaces/user";

interface ICommentModel extends Model<IComment> {
  createComment: (data: IReceivedComment, user: IUser) => IComment;
  findCommentsByPostId: (
    postId: mongoose.Types.ObjectId
  ) => Promise<IComment[]>;
  findOneCommentAndDelete: (id: mongoose.Types.ObjectId) => Promise<IComment>;
  findCommentByIdAndUpdate: (
    id: mongoose.Types.ObjectId,
    updateComment: string
  ) => Promise<IComment>;
}

const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    comment: { type: String, Required: true },
    createdBy: {
      type: new Schema({
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        fullName: { type: String, required: true },
      }),
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

commentSchema.statics.createComment = function (
  data: IReceivedComment,
  user: IUser
): IComment {
  const comment = new CommentModel(pick(data, ["post", "comment", "userId"]));
  comment.createdBy = {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
  };

  return comment;
};

commentSchema.statics.findCommentsByPostId = async function (
  postId: mongoose.Types.ObjectId
): Promise<IComment[]> {
  return await this.find({
    post: postId,
  }).select("-__v -updatedAt");
};

commentSchema.statics.findOneCommentAndDelete = async function (
  id: mongoose.Types.ObjectId
): Promise<IComment> {
  return await this.findOneAndDelete({ _id: id });
};

commentSchema.statics.findCommentByIdAndUpdate = async function (
  id: mongoose.Types.ObjectId,
  updateComment: string
): Promise<IComment> {
  const options = { new: true };

  return await this.findByIdAndUpdate(id, { comment: updateComment }, options);
};

export const validate = (comment: object): ValidationResult => {
  const schema: Joi.ObjectSchema<IComment> = Joi.object({
    post: Joi.string().required(),
    comment: Joi.string().required(),
    userId: Joi.string().required(),
  });

  return schema.validate(comment);
};

const CommentModel: ICommentModel = mongoose.model<IComment, ICommentModel>(
  "Comment",
  commentSchema
);
export default CommentModel;
