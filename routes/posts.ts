import { Router, Request, Response } from "express";
import _ from "lodash";
import Post, { IPost, validate } from "../models/post";
import User from "../models/user";
import auth from "../middlewares/auth";

const router: Router = Router();

router.post("/", auth, async (req: Request, res: Response) => {
  const { error } = validate(req.body);
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
    await post.save();
    res.send(post);
  } catch (error) {
    console.log(error);
    res.status(500).send("Unexpected error occured");
  }
});

router.get("/", auth, async (req: Request, res: Response) => {
  // const t = await Post.find({}).select("-__v");
  // console.log(t);
  // the aggregate function below counts comments of each posts
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

export = router;
