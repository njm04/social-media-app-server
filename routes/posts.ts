import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import Joi, { ValidationResult } from "joi";
import _ from "lodash";
import Post, { validate } from "../models/post";
import auth from "../middlewares/auth";
import validateObjectId from "../middlewares/validateObjectId";
import User from "../models/user";
import Images from "../models/image";
import Like from "../models/like";

const router: Router = Router();

router.post("/", auth, async (req: Request, res: Response) => {
  const { error } = validate(_.pick(req.body, ["postedBy", "post"]));
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findUserById(req.body.postedBy);
  if (!user) return res.status(400).send("Invalid user");

  try {
    const post = Post.createPost(user._id, req.body.post, req.body.imageData, {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
    });

    await Images.saveImage(req.body.imageData, user._id, post._id);
    await post.save();

    res.send(post);
  } catch (error) {
    console.log(error);
    res.status(500).send("Unexpected error occured");
  }
});

router.post("/like", auth, async (req: Request, res: Response) => {
  const { error } = validateIds(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findUserById(req.body.userId);
  if (!user) return res.status(400).send("Invalid user");

  let post = await Post.findPostById(req.body.postId);
  if (!post) return res.status(400).send("Invalid post");

  const likeInfo = await Like.findOneLikeByPostIdAndUserId(post._id, user._id);
  /**
   * Like and unlike logic
   */
  if (!likeInfo) {
    post = await Post.findPostByIdAndUpdateLikes(req.body.postId, { likes: 1 });
    if (!post) return res.status(400).send("Invalid post");

    return res.send(post);
  } else {
    const deleted = await Like.deleteOneLike(post._id, user._id);
    if (deleted.ok === 1 && post.likes > 0) {
      post = await Post.findPostByIdAndUpdateLikes(req.body.postId, {
        likes: -1,
      });
      if (!post) return res.status(400).send("Invalid post");

      return res.send(post);
    }
  }
});

router.get("/", auth, async (req: Request, res: Response) => {
  const posts = await Post.aggregateCommentCount();
  res.send(posts);
});

router.delete(
  "/:id",
  [auth, validateObjectId],
  async (req: Request, res: Response) => {
    const post = await Post.findPostById(
      mongoose.Types.ObjectId(req.params.id)
    );
    if (!post) return res.status(400).send("Post not found");

    const deleted = await Post.deleteOnePost(post._id);
    if (deleted.ok !== 1) return res.status(400).send("Unable to delete");
    await Like.deletePostLikes(post._id);
    res.send(post);
  }
);

router.patch(
  "/:id",
  [auth, validateObjectId],
  async (req: Request, res: Response) => {
    if (!req.body.newPost) return res.status(400).send("empty post");

    const post = await Post.findPostByIdAndUpdate(
      mongoose.Types.ObjectId(req.params.id),
      req.body.newPost
    );
    if (!post) return res.status(400).send("Invalid post");
    res.send(post);
  }
);

const validateIds = (data: object): ValidationResult => {
  const schema: Joi.ObjectSchema = Joi.object({
    userId: Joi.string().required(),
    postId: Joi.string().required(),
  });

  return schema.validate(data);
};

export = router;
