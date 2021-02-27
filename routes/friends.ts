import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import _ from "lodash";
import FriendRequest, {
  validate as validateFriendRequest,
} from "../models/friendRequest";
import { IFriendRequest } from "../interfaces/friendRequest";
import auth from "../middlewares/auth";

const router: Router = Router();

router.get("/", auth, async (req: Request, res: Response) => {
  const { _id: userId } = (req as any).user;
  const friends = await FriendRequest.findRequestsByRequesterOrRecipient(
    userId
  );
  res.send(friends);
});

router.get("/accepted", auth, async (req: Request, res: Response) => {
  const { _id: userId } = (req as any).user;
  const friends = await FriendRequest.findFriendsById(userId);
  res.send(friends);
});

router.get(
  "/friend-request-notification",
  auth,
  async (req: Request, res: Response) => {
    const { _id: userId } = (req as any).user;
    const friends = await FriendRequest.findRequestsByRecipient(userId);
    res.send(friends);
  }
);

router.post("/", auth, async (req: Request, res: Response) => {
  const { error } = validateFriendRequest(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const isAlreadyRequested = await FriendRequest.findOneRequestByRequesterAndRecipient(
    req.body.requester,
    req.body.recipient
  );

  if (isAlreadyRequested)
    return res.status(400).send("You already sent a request");

  try {
    const friendRequest = FriendRequest.createFriendRequest(req.body);
    friendRequest.save();
    res.send(friendRequest);
  } catch (error) {
    res.status(500).send("Unexpected error occured");
  }
});

router.delete("/:id", auth, async (req: Request, res: Response) => {
  const id = mongoose.Types.ObjectId(req.params.id);
  const friend = await FriendRequest.findOneRequestAndDelete(id);
  if (!friend) return res.status(400).send("Unable to delete");
  res.send(friend);
});

router.patch("/:id", auth, async (req: Request, res: Response) => {
  const options = { new: true };
  const id = mongoose.Types.ObjectId(req.params.id);
  if (!req.body.status) return res.status(400).send("Invalid status");
  const friendRequest = await FriendRequest.findRequestByIdAndUpdate(
    id,
    req.body.status
  );
  if (!friendRequest) return res.status(400).send("Invalid friend request");

  res.send(friendRequest);
});

// this route has not been used.
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
