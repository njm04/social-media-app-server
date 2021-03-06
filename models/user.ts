import mongoose, { Document, Model } from "mongoose";
import Joi, { ValidationResult } from "joi";
import { pick } from "lodash";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "config";
import { IUser, ItokenPayload } from "../interfaces/user";
import moment from "moment";
// import joiObjectId from "joi-objectid";
// const myJoiObjectId = joiObjectId(Joi);

// static methods
interface IUserModel extends Model<IUser> {
  findByIdAndUpdateStatusToActive: (
    id: mongoose.Types.ObjectId
  ) => Promise<void>;
  findByIdAndUpdateStatusToOffline: (
    id: mongoose.Types.ObjectId
  ) => Promise<IUser>;
  findOneByEmail: (email: string) => Promise<IUser>;
  findByIdAndUpdatePhoto: (
    id: mongoose.Types.ObjectId,
    name: string,
    url: string,
    type: string
  ) => Promise<IUser>;
  findBySearchQuery: (searchQuery: string) => Promise<IUser[]>;
  findAllUsers: () => Promise<IUser[]>;
  findUserById: (id: mongoose.Types.ObjectId) => Promise<IUser>;
  findOneUserById: (
    id: mongoose.Types.ObjectId,
    requester: mongoose.Types.ObjectId,
    recipient: mongoose.Types.ObjectId
  ) => Promise<IUser>;
}

const Schema = mongoose.Schema;

const userSchema: mongoose.Schema<IUser> = new Schema(
  {
    email: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    fullName: { type: String },
    gender: { type: String, required: true },
    birthDate: { type: Date, required: true, default: Date.now },
    age: { type: Number },
    contactNumber: { type: String, default: "" },
    address: { type: String, default: "" },
    addressTwo: { type: String, default: "" },
    state: { type: String, default: "" },
    city: { type: String, default: "" },
    zip: { type: String, default: "" },
    status: {
      type: String,
      required: true,
      enum: ["active", "deactivated", "unverified", "online", "offline"],
      default: "offline",
    },
    password: { type: String, required: true },
    friends: [String],
    isDeleted: { type: Boolean, required: true, default: false },
    profilePicture: new Schema(
      {
        name: { type: String },
        url: { type: String },
      },
      { _id: false }
    ),
    coverPhoto: new Schema(
      {
        name: { type: String },
        url: { type: String },
      },
      { _id: false }
    ),
  },
  {
    timestamps: true,
  }
);

userSchema.statics.findByIdAndUpdateStatusToActive = async function (
  id: mongoose.Types.ObjectId
): Promise<void> {
  await this.findByIdAndUpdate(id, { status: "active" });
};

userSchema.statics.findByIdAndUpdateStatusToOffline = async function (
  id: mongoose.Types.ObjectId
): Promise<IUser> {
  return await this.findByIdAndUpdate(id, { status: "offline" });
};

userSchema.statics.findOneByEmail = async function (
  email: string
): Promise<IUser> {
  return await this.findOne({ email });
};

userSchema.statics.findByIdAndUpdatePhoto = async function (
  id: mongoose.Types.ObjectId,
  name: string,
  url: string,
  type: string
): Promise<IUser> {
  const options = { new: true };
  if (type === "profile-picture") {
    return await this.findByIdAndUpdate(
      id,
      { profilePicture: { name, url } },
      options
    );
  } else {
    return await this.findByIdAndUpdate(
      id,
      { coverPhoto: { name, url } },
      options
    );
  }
};

userSchema.statics.findBySearchQuery = async function (
  searchQuery: string
): Promise<IUser[]> {
  return await this.find({
    fullName: { $regex: searchQuery, $options: "i" },
  }).select("_id fullName profilePicture");
};

userSchema.statics.findAllUsers = async function (): Promise<IUser[]> {
  return await this.find({}).select("-password -__v");
};

userSchema.pre<IUser>("save", function (next): void {
  this.fullName = `${this.firstName} ${this.lastName}`;
  next();
});

userSchema.statics.findUserById = async function (
  id: mongoose.Types.ObjectId
): Promise<IUser> {
  return await this.findById(id);
};

userSchema.statics.findOneUserById = async function (
  id: mongoose.Types.ObjectId,
  requester: mongoose.Types.ObjectId,
  recipient: mongoose.Types.ObjectId
): Promise<IUser> {
  return await this.findOne({
    $or: [{ _id: requester }, { _id: recipient }],
    _id: { $ne: id },
  }).select("_id fullName profilePicture status");
};

userSchema.methods.generateAuthToken = async function (): Promise<string> {
  const user = await UserModel.findUserById(this._id);

  const payload: ItokenPayload = {
    _id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    status: user.status,
    profilePicture: user.profilePicture,
    coverPhoto: user.coverPhoto,
  };

  return jwt.sign(payload, config.get("jwtPrivateKey"));
};

userSchema.methods.validatePassword = async function (
  currentPassword: string,
  inputtedPassword: string
): Promise<boolean> {
  const validPassword: boolean = await bcrypt.compare(
    inputtedPassword,
    currentPassword
  );

  return validPassword;
};

userSchema.pre<IUser>("save", function (next) {
  this.age = moment().diff(this.birthDate, "years");
  next();
});

const UserModel: IUserModel = mongoose.model<IUser, IUserModel>(
  "User",
  userSchema
);
export default UserModel;

export const validate = (user: object): ValidationResult => {
  const schema: Joi.ObjectSchema<IUser> = Joi.object({
    email: Joi.string().min(5).max(255).email().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    birthDate: Joi.date().required(),
    contactNumber: Joi.string().min(10).max(20).optional(),
    gender: Joi.string().required(),
    password: Joi.string().min(5).max(1000).required(),
    address: Joi.string().min(3).max(255).optional(),
    state: Joi.string().max(255).optional(),
    addressTwo: Joi.string().max(10).optional().allow(""),
    city: Joi.string().min(3).max(255).optional(),
    zip: Joi.string().min(6).max(255).optional(),
    status: Joi.string(),
    isDeleted: Joi.boolean(),
  });

  return schema.validate(user);
};
