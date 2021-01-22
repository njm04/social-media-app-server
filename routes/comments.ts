import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import _ from "lodash";
import Comment, { IComment, validate } from "../models/comment";
import User from "../models/user";
import Post, { IPost } from "../models/post";
import CommentCount from "../models/commentCount";
import auth from "../middlewares/auth";
import Joi, { ValidationResult } from "joi";
import validateObjectId from "../middlewares/validateObjectId";

const router: Router = Router();

router.post("/", auth, async (req: Request, res: Response) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findById(req.body.userId);
  if (!user) return res.status(400).send("Invalid user");

  const post = await Post.findById(req.body.post);
  if (!post) return res.status(400).send("Invalid post");

  try {
    const comment: IComment = new Comment(
      _.pick(req.body, ["post", "comment", "userId"])
    );
    comment.createdBy = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
    };

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
    const post: IPost | null = await Post.findById(req.params.id);
    if (!post) return res.status(400).send("Invalid post");

    const comments: IComment[] = await Comment.find({
      post: post._id,
    }).select("-__v -updatedAt");
    // if (!comments || comments.length === 0)
    //   return res.status(400).send("No comments found");

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
    const comment = await Comment.findOneAndDelete({ _id: req.params.id });
    if (!comment) return res.status(400).send("Invalid comment");

    res.send(comment);
  }
);

router.patch(
  "/:id",
  [auth, validateObjectId],
  async (req: Request, res: Response) => {
    const options = { new: true };

    if (!req.body.updatedComment) return res.status(400).send("empty comment");

    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { comment: req.body.updatedComment },
      options
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
