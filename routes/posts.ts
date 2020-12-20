import { Router, Request, Response } from "express";
import _ from "lodash";
import Post, { IPost, validate } from "../models/post";
import auth from "../middlewares/auth";

const router: Router = Router();

router.post("/", auth, async (req: Request, res: Response) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const post: IPost = new Post(_.pick(req.body, ["post", "postedBy"]));
    await post.save();
    res.send(post);
  } catch (error) {
    console.log(error);
    res.status(500).send("Unexpected error occured");
  }
});

router.get("/", auth, async (req: Request, res: Response) => {
  const posts = await Post.find({})
    .populate("postedBy", "_id name firstName lastName fullName")
    .select("-__v");
  res.send(posts);
});

export = router;
