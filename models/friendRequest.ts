import mongoose, { Document } from "mongoose";
import Joi, { ValidationResult } from "joi";

export interface IFriendRequest extends Document {
  requester: string;
  recipient: string;
  status: string;
}

const Schema = mongoose.Schema;

const friendRequestSchema: mongoose.Schema<IFriendRequest> = new Schema({
  requester: { type: String, required: true },
  recipient: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ["requested", "accepted", "rejected"],
  },
});

export const validate = (friendRequest: object): ValidationResult => {
  const schema: Joi.ObjectSchema<IFriendRequest> = Joi.object({
    requester: Joi.string().required(),
    recipient: Joi.string().required(),
    status: Joi.string().required(),
  });

  return schema.validate(friendRequest);
};

export default mongoose.model<IFriendRequest>(
  "FriendRequest",
  friendRequestSchema
);
