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

  const options = { new: true };
  const likeInfo = await Like.findOneAndUpdate(
    { postId: post._id },
    { $inc: { likesCount: 1 } },
    options
  );
  if (likeInfo) return res.send(likeInfo);
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

  const deleted = await Like.deleteOne({ userId: user._id, postId: post._id });
  res.send(deleted);
});

export = router;
