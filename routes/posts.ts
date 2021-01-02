import { Router, Request, Response } from "express";
import Joi, { ValidationResult } from "joi";
import _ from "lodash";
import Post, { IPost, validate } from "../models/post";
import auth from "../middlewares/auth";
import validateObjectId from "../middlewares/validateObjectId";
import User from "../models/user";
import Images from "../models/image";
import Like from "../models/like";

const router: Router = Router();

router.post("/", auth, async (req: Request, res: Response) => {
  const { error } = validate(_.pick(req.body, ["postedBy", "post"]));
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findById(req.body.postedBy);
  if (!user) return res.status(400).send("Invalid user");

  try {
    const post: IPost = new Post({
      post: req.body.post,
      postedBy: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
      },
    });

    const images = new Images({
      imageData: req.body.imageData,
      postId: post._id,
      userId: user._id,
    });
    post.postImages = req.body.imageData;

    await post.save();
    await images.save();

    res.send(post);
  } catch (error) {
    console.log(error);
    res.status(500).send("Unexpected error occured");
  }
});

router.post("/like", auth, async (req: Request, res: Response) => {
  const { error } = validateIds(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findById(req.body.userId);
  if (!user) return res.status(400).send("Invalid user");

  let post = await Post.findById(req.body.postId);
  if (!post) return res.status(400).send("Invalid post");

  const likeInfo = await Like.findOne({
    postId: post._id,
    userId: user._id,
  });

  /**
   * Like and unlike logic
   */
  if (!likeInfo) {
    post = await Post.findByIdAndUpdate(
      req.body.postId,
      {
        $inc: { likes: 1 },
      },
      { new: true }
    );
    if (!post) return res.status(400).send("Invalid post");

    return res.send(post);
  } else {
    const deleted = await Like.deleteOne({
      postId: post._id,
      userId: user._id,
    });
    if (deleted.ok === 1 && post.likes > 0) {
      post = await Post.findByIdAndUpdate(
        req.body.postId,
        {
          $inc: { likes: -1 },
        },
        { new: true }
      );
      if (!post) return res.status(400).send("Invalid post");

      return res.send(post);
    }
  }
});

router.get("/", auth, async (req: Request, res: Response) => {
  const posts = await Post.aggregate([
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

  res.send(posts);
});

router.delete(
  "/:id",
  [auth, validateObjectId],
  async (req: Request, res: Response) => {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(400).send("Post not found");

    const deleted = await Post.deleteOne({ _id: post._id });
    if (deleted.ok !== 1) return res.status(400).send("Unable to delete");
    await Like.deleteOne({ postId: post._id });
    res.send(post);
  }
);

router.patch(
  "/:id",
  [auth, validateObjectId],
  async (req: Request, res: Response) => {
    const options = { new: true };

    if (!req.body.newPost) return res.status(400).send("empty post");

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { post: req.body.newPost },
      options
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
