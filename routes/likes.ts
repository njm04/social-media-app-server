import { Router, Request, Response } from "express";
import Like, { validate } from "../models/like";
import Post from "../models/post";
import User from "../models/user";
import auth from "../middlewares/auth";

const router: Router = Router();

router.post("/", auth, async (req: Request, res: Response) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findById(req.body.userId);
  if (!user) return res.status(400).send("Invalid user");

  const post = await Post.findById(req.body.postId);
  if (!post) return res.status(400).send("Invalid post");

  const like = await Like.findOne({ postId: post._id, userId: user._id });
  if (like) return res.send(like);
  else {
    try {
      const like = new Like({
        userId: user._id,
        postId: post._id,
        likesCount: 1,
      });

      await like.save();
      res.send(like);
    } catch (error) {
      console.log(error);
      res.status(500).send("Unexpected error occured");
    }
  }
});

router.get("/", auth, async (req: Request, res: Response) => {
  const likes = await Like.find({}).select("-__v");
  res.send(likes);
});

router.delete("/", auth, async (req: Request, res: Response) => {
  const user = await User.findById(req.body.userId);
  if (!user) return res.status(400).send("Invalid user");

  const post = await Post.findById(req.body.postId);
  if (!post) return res.status(400).send("Invalid post");

  const like = await Like.findOne({ userId: user._id, postId: post._id });
  if (!like) return res.status(400).send("Invalid like");

  await Like.deleteOne({ userId: user._id, postId: post._id });
  res.send(like);
});

export = router;
