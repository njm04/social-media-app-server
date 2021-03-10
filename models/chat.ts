import mongoose, { Document, Model } from "mongoose";
import Joi, { ValidationResult } from "joi";
import { IChat } from "../interfaces/chat";

interface IChatModel extends Model<IChat> {
  findChatByPartipantIds: (
    sentBy: mongoose.Types.ObjectId,
    recipient: mongoose.Types.ObjectId
  ) => Promise<IChat>;
}

const Schema = mongoose.Schema;

const chatSchema = new Schema({
  messages: [
    {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
  ],
  participants: [
    {
      type: new Schema({
        userId: { type: mongoose.Types.ObjectId, required: true },
        status: { type: String, required: true },
        fullName: { type: String, required: true },
      }),
    },
  ],
});

chatSchema.statics.findChatByPartipantIds = async function (
  sentBy: mongoose.Types.ObjectId,
  recipient: mongoose.Types.ObjectId
): Promise<IChat> {
  return await this.findOne({
    participants: {
      $all: [sentBy, recipient],
    },
  });
};

const ChatModel: IChatModel = mongoose.model<IChat, IChatModel>(
  "Chat",
  chatSchema
);
export default ChatModel;

export const validate = (chat: object): ValidationResult => {
  const schema: Joi.ObjectSchema<IChat> = Joi.object({
    messages: Joi.object({
      message: Joi.string().required(),
      sentBy: Joi.string().required(),
      recipient: Joi.string().required(),
    }),
  });

  return schema.validate(chat);
};
