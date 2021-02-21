import mongoose, { Document, Model } from "mongoose";
import Joi, { ValidationResult } from "joi";
import { IPost, IPostedBy } from "../interfaces/post";

interface IPostModel extends Model<IPost> {
  createPost: (
    id: mongoose.Types.ObjectId,
    postString: string,
    imageData: object[],
    postedBy: IPostedBy
  ) => IPost;
  findPostById: (id: mongoose.Types.ObjectId) => Promise<IPost>;
  findPostByIdAndUpdateLikes: (
    id: mongoose.Types.ObjectId,
    inc: object
  ) => Promise<IPost>;
  aggregateCommentCount: () => Promise<any[]>;
  deleteOnePost: (id: mongoose.Types.ObjectId) => Promise<any>;
  findPostByIdAndUpdate: (
    id: mongoose.Types.ObjectId,
    post: string
  ) => Promise<IPost>;
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

postSchema.statics.createPost = function (
  id: mongoose.Types.ObjectId,
  postString: string,
  imageData: object[],
  postedBy: IPostedBy
): IPost {
  const post = new PostModel({
    _id: id,
    post: postString,
    postedBy,
  });

  post.postImages = imageData;
  return post;
};

postSchema.statics.findPostById = async function (
  id: mongoose.Types.ObjectId
): Promise<IPost> {
  return await this.findById(id);
};

postSchema.statics.findPostByIdAndUpdateLikes = async function (
  id: mongoose.Types.ObjectId,
  inc: object
): Promise<IPost> {
  return await this.findByIdAndUpdate(id, { $inc: inc }, { new: true });
};

postSchema.statics.aggregateCommentCount = async function (): Promise<any[]> {
  return await this.aggregate([
    {
      $lookup: {
        from: "comments",
        let: { post: "$_id" },
        pipeline: [{ $match: { $expr: { $eq: ["$$post", "$post"] } } }],
        as: "commentCount",
      },
    },
    { $addFields: { commentCount: { $size: "$commentCount" } } },
  ]);
};

postSchema.statics.findPostByIdAndUpdate = async function (
  id: mongoose.Types.ObjectId,
  post: string
): Promise<IPost> {
  const options = { new: true };
  return await this.findByIdAndUpdate(id, { post }, options);
};

postSchema.statics.deleteOnePost = async function (
  id: mongoose.Types.ObjectId
): Promise<any> {
  return await this.deleteOne({ _id: id });
};

const PostModel: IPostModel = mongoose.model<IPost, IPostModel>(
  "Post",
  postSchema
);
export default PostModel;

export const validate = (post: object): ValidationResult => {
  const schema: Joi.ObjectSchema<IPost> = Joi.object({
    post: Joi.string().required().allow(""),
    postedBy: Joi.string().required(),
  });

  return schema.validate(post);
};
