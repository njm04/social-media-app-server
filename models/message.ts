import mongoose, { Document, Model } from "mongoose";
import Joi, { ValidationResult } from "joi";
import { IMessage } from "../interfaces/message";

interface IMessageModel extends Model<IMessage> {}

const Schema = mongoose.Schema;

const messageSchema = new Schema(
  {
    sentBy: { type: mongoose.Types.ObjectId, required: true },
    recipient: { type: mongoose.Types.ObjectId, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

const MessageModel = mongoose.model<IMessage>("Message", messageSchema);
export default MessageModel;

export const validate = (message: object): ValidationResult => {
  const schema: Joi.ObjectSchema<IMessage> = Joi.object({
    sentBy: Joi.string().required(),
    recipient: Joi.string().required(),
    message: Joi.string().required(),
  });

  return schema.validate(message);
};
