import mongoose, { Document, Model } from "mongoose";
import Joi, { ValidationResult } from "joi";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "config";
import { IUser, ItokenPayload } from "../interfaces/user";
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
    contactNumber: { type: String, required: true },
    address: { type: String, require: true },
    addressTwo: { type: String, default: "" },
    state: { type: String, required: true },
    city: { type: String, required: true },
    zip: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ["active", "deactivated", "unverified", "online", "offline"],
      default: "active",
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

userSchema.pre<IUser>("save", function (next): void {
  this.fullName = `${this.firstName} ${this.lastName}`;
  next();
});

userSchema.methods.generateAuthToken = function (): string {
  const payload: ItokenPayload = {
    _id: this._id,
    email: this.email,
    firstName: this.firstName,
    lastName: this.lastName,
    fullName: this.fullName,
    profilePicture: this.profilePicture,
    coverPhoto: this.coverPhoto,
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
    contactNumber: Joi.string().min(10).max(20).required(),
    gender: Joi.string().required(),
    password: Joi.string().min(5).max(1000).required(),
    address: Joi.string().min(3).max(255).required(),
    state: Joi.string().max(255).required(),
    addressTwo: Joi.string().max(10).optional().allow(""),
    city: Joi.string().min(3).max(255).required(),
    zip: Joi.string().min(6).max(255).required(),
    status: Joi.string().required(),
    isDeleted: Joi.boolean(),
  });

  return schema.validate(user);
};
