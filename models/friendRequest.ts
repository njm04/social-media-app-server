import mongoose, { Model } from "mongoose";
import Joi, { ValidationResult } from "joi";
import { pick } from "lodash";
import { IFriendRequest } from "../interfaces/friendRequest";

interface IFriendRequestModel extends Model<IFriendRequest> {
  findRequestsByRequesterOrRecipient: (
    userId: mongoose.Types.ObjectId
  ) => Promise<IFriendRequest[]>;
  findRequestsByRecipient: (
    userId: mongoose.Types.ObjectId
  ) => Promise<IFriendRequest[]>;
  findOneRequestByRequesterAndRecipient: (
    requester: mongoose.Types.ObjectId,
    recipient: mongoose.Types.ObjectId
  ) => Promise<IFriendRequest>;
  findOneRequestAndDelete: (
    id: mongoose.Types.ObjectId
  ) => Promise<IFriendRequest>;
  findRequestByIdAndUpdate: (
    id: mongoose.Types.ObjectId,
    status: string
  ) => Promise<IFriendRequest>;
  createFriendRequest: (data: IFriendRequest) => IFriendRequest;
}

const Schema = mongoose.Schema;

const friendRequestSchema: mongoose.Schema<IFriendRequest> = new Schema({
  requester: { type: mongoose.Types.ObjectId, required: true },
  recipient: { type: mongoose.Types.ObjectId, required: true },
  status: {
    type: String,
    required: true,
    enum: ["requested", "accepted", "rejected"],
  },
});

friendRequestSchema.statics.findRequestsByRequesterOrRecipient = async function (
  userId: mongoose.Types.ObjectId
): Promise<IFriendRequest[]> {
  return await this.find({
    $or: [{ requester: userId }, { recipient: userId }],
    status: { $ne: "rejected" },
  }).select("-__v");
};

friendRequestSchema.statics.findRequestsByRecipient = async function (
  userId: mongoose.Types.ObjectId
): Promise<IFriendRequest[]> {
  return await this.find({
    recipient: userId,
    status: "requested",
  }).select("-__v");
};

friendRequestSchema.statics.findOneRequestByRequesterAndRecipient = async function (
  requester: mongoose.Types.ObjectId,
  recipient: mongoose.Types.ObjectId
): Promise<IFriendRequest> {
  return await this.findOne({
    requester,
    recipient,
  });
};

friendRequestSchema.statics.findOneRequestAndDelete = async function (
  id: mongoose.Types.ObjectId
): Promise<IFriendRequest> {
  return await this.findOneAndDelete({
    _id: id,
  }).select("-__v");
};

friendRequestSchema.statics.findRequestByIdAndUpdate = async function (
  id: mongoose.Types.ObjectId,
  status: string
): Promise<IFriendRequest> {
  const options = { new: true };
  return await this.findByIdAndUpdate(id, { status }, options).select("-__v");
};

friendRequestSchema.statics.createFriendRequest = function (
  data: IFriendRequest
): IFriendRequest {
  const friendRequest = new FriendRequestModel(
    pick(data, ["requester", "recipient", "status"])
  );

  return friendRequest;
};

export const validate = (friendRequest: object): ValidationResult => {
  const schema: Joi.ObjectSchema<IFriendRequest> = Joi.object({
    requester: Joi.string().required(),
    recipient: Joi.string().required(),
    status: Joi.string().required(),
  });

  return schema.validate(friendRequest);
};

const FriendRequestModel: IFriendRequestModel = mongoose.model<
  IFriendRequest,
  IFriendRequestModel
>("FriendRequest", friendRequestSchema);
export default FriendRequestModel;
