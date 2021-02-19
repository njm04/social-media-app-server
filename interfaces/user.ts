import mongoose, { Document } from "mongoose";

export interface IProfPic {
  name: string;
  url: string;
}

export interface IUser extends Document {
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  gender: string;
  birthDate: string;
  age?: number;
  contactNumber: string;
  address: string;
  addressTwo?: string;
  state: string;
  city: string;
  zip: string;
  status: string;
  password: string;
  friends?: string[];
  profilePicture: IProfPic;
  coverPhoto: IProfPic;
  generateAuthToken(): string;
  validatePassword: (
    currentPassword: string,
    inputtedPassword: string
  ) => Promise<boolean>;
}

export interface ItokenPayload {
  _id: mongoose.Types.ObjectId;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  profilePicture: IProfPic;
  coverPhoto: IProfPic;
}
