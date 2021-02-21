import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import _ from "lodash";
import Comment, { validate } from "../models/comment";
import { IComment } from "../interfaces/comments";
import User from "../models/user";
import Post from "../models/post";
import { IPost } from "../interfaces/post";
import CommentCount from "../models/commentCount";
import auth from "../middlewares/auth";
import Joi, { ValidationResult } from "joi";
import validateObjectId from "../middlewares/validateObjectId";

const router: Router = Router();

router.post("/", auth, async (req: Request, res: Response) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findUserById(req.body.userId);
  if (!user) return res.status(400).send("Invalid user");

  const post = await Post.findPostById(req.body.post);
  if (!post) return res.status(400).send("Invalid post");

  try {
    const comment = Comment.createComment(req.body, user);
    await comment.save();

    let count = await CommentCount.findOne({ postId: post._id });
    if (!count) {
      count = new CommentCount({
        postId: post._id,
      });
      count.count += 1;
      await count.save();
    } else {
      await CommentCount.updateOne(
        { postId: post._id },
        { $inc: { count: 1 } }
      );
    }

    res.send(comment);
  } catch (error) {
    console.log(error);
    res.status(500).send("Unexpected error occurred");
  }
});

router.get(
  "/:id",
  [auth, validateObjectId],
  async (req: Request, res: Response) => {
    const postId = mongoose.Types.ObjectId(req.params.id);
    const post = await Post.findPostById(postId);
    if (!post) return res.status(400).send("Invalid post");

    const comments = await Comment.findCommentsByPostId(post._id);
    res.send(comments);
  }
);

router.get("/", auth, async (req: Request, res: Response) => {
  const commentsCount = await CommentCount.find({});
  console.log(commentsCount);
  res.send(commentsCount.length > 0 && commentsCount);
});

router.delete(
  "/:id",
  [auth, validateObjectId],
  async (req: Request, res: Response) => {
    const id = mongoose.Types.ObjectId(req.params.id);
    const comment = await Comment.findOneCommentAndDelete(id);
    if (!comment) return res.status(400).send("Invalid comment");

    res.send(comment);
  }
);

router.patch(
  "/:id",
  [auth, validateObjectId],
  async (req: Request, res: Response) => {
    const id = mongoose.Types.ObjectId(req.params.id);
    if (!req.body.updatedComment) return res.status(400).send("empty comment");

    const comment = await Comment.findCommentByIdAndUpdate(
      id,
      req.body.updatedComment
    );
    if (!comment) return res.status(400).send("Invalid comment");
    res.send(comment);
  }
);

const validatePostId = (id: object): ValidationResult => {
  const schema: Joi.ObjectSchema = Joi.object({
    postId: Joi.string().required(),
  });

  return schema.validate(id);
};

export = router;
