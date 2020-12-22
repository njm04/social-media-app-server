import { Router, Request, Response } from "express";
import _ from "lodash";
import Comment, { IComment, validate } from "../models/comment";
import User from "../models/user";
import Post, { IPost } from "../models/post";
import CommentCount from "../models/commentCount";
import auth from "../middlewares/auth";
import Joi, { ValidationResult } from "joi";

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

router.get("/:postId", auth, async (req: Request, res: Response) => {
  const post: IPost | null = await Post.findById(req.params.postId);
  if (!post) return res.status(400).send("Invalid post");

  const comments: IComment[] = await Comment.find({
    post: post._id,
  }).select("-__v -updatedAt");
  if (!comments || comments.length === 0)
    return res.status(400).send("No comments found");
  console.log(comments);
  res.send(comments);
});

router.get("/count/:postId", auth, async (req: Request, res: Response) => {
  console.log(req.params);
  const post: IPost | null = await Post.findById(req.params.postId);
  if (!post) return res.status(400).send("Invalid post");

  const commentsCount = await CommentCount.findOne({ postId: post._id }).select(
    "_id postId count"
  );
  res.send(commentsCount);
});

const validatePostId = (id: object): ValidationResult => {
  const schema: Joi.ObjectSchema = Joi.object({
    postId: Joi.string().required(),
  });

  return schema.validate(id);
};

export = router;
