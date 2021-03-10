import mongoose, { Document } from "mongoose";
import { IMessage } from "./message";

interface IParticipants {
  userId: mongoose.Types.ObjectId;
  fullName: string;
  status: string;
}

export interface IChat extends Document {
  messages: IMessage[];
  participants: IParticipants[];
}
