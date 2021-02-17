import express, { Router, Request, Response } from "express";
import _ from "lodash";
import FriendRequest, {
  IFriendRequest,
  validate as validateFriendRequest,
} from "../models/friendRequest";
import auth from "../middlewares/auth";

const router: Router = Router();

router.get("/", auth, async (req: Request, res: Response) => {
  const userId: string = (req as any).user;
  const friends = await FriendRequest.find({
    $or: [{ requester: userId }, { recipient: userId }],
    status: { $ne: "rejected" },
  }).select("-__v");

  res.send(friends);
});

router.get(
  "/friend-request-notification",
  auth,
  async (req: Request, res: Response) => {
    const userId: string = (req as any).user;
    const friends = await FriendRequest.find({
      recipient: userId,
      status: { $ne: "rejected" },
    }).select("-__v");
    res.send(friends);
  }
);

router.post("/", auth, async (req: Request, res: Response) => {
  const { error } = validateFriendRequest(req.body);
  if (error) return res.status(400).send(error.details[0].message);

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

router.delete("/:id", auth, async (req: Request, res: Response) => {
  const friend = await FriendRequest.findOneAndDelete({
    _id: req.params.id,
  }).select("-__v");
  if (!friend) return res.status(400).send("Unable to delete");
  res.send(friend);
});

router.patch("/:id", auth, async (req: Request, res: Response) => {
  const options = { new: true };
  if (!req.body.status) return res.status(400).send("Invalid status");
  const friendRequest = await FriendRequest.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    options
  ).select("-__v");
  if (!friendRequest) return res.status(400).send("Invalid friend request");

  res.send(friendRequest);
});

// prepared for future use
router.patch(
  "/reject-request/:id",
  auth,
  async (req: Request, res: Response) => {
    const options = { new: true };
    if (!req.body.status) return res.status(400).send("Invalid status");
    const friendRequest = await FriendRequest.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      options
    ).select("-__v");
    if (!friendRequest) return res.status(400).send("Invalid friend request");

    res.send(friendRequest);
  }
);

export = router;
