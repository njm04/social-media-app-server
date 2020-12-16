import express, { Router, Request, Response } from "express";
import _ from "lodash";
import User, { IUser } from "../models/user";
import FriendRequest, {
  IFriendRequest,
  validate as validateFriendRequest,
} from "../models/friendRequest";
import auth from "../middlewares/auth";

const router: Router = Router();

router.post("/", auth, async (req: Request, res: Response) => {
  const { error } = validateFriendRequest(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // const friend: IUser[] = await User.find({
  //   friends: { $in: [req.body.recipient] },
  // });
  // console.log(friend);
  // if (!friend) return res.status(400).send("You are already friends");

  const isAlreadyRequested = await FriendRequest.findOne({
    requester: req.body.requester,
    recipient: req.body.recipient,
  });
  if (isAlreadyRequested)
    return res.status(400).send("You already sent a request");

  try {
    const friendRequest: IFriendRequest = new FriendRequest(
      _.pick(req.body, ["requester", "recipient", "status"])
    );
    friendRequest.save();
    res.send(friendRequest);
  } catch (error) {
    res.status(500).send("Unexpected error occured");
  }
});

export = router;
