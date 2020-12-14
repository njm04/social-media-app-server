import { Router, Request, Response } from "express";
import _ from "lodash";
import Comment, { IComment, validate } from "../models/comment";
import User from "../models/user";
import Post from "../models/post";
import auth from "../middlewares/auth";

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
      firstName: user.firstName,
      lastName: user.lastName,
    };
    await comment.save();
    res.send(comment);
  } catch (error) {
    console.log(error);
    res.status(500).send("Unexpected error occurred");
  }
});

export = router;
