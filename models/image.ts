import mongoose, { Document, Model } from "mongoose";
import Joi, { ValidationResult } from "joi";
import { IUploadImage } from "../interfaces/image";
import { IProfPic } from "../interfaces/user";

interface IImageModel extends Model<IUploadImage> {
  saveImage: (
    imageData: IProfPic,
    userId: mongoose.Types.ObjectId,
    postId?: mongoose.Types.ObjectId
  ) => Promise<void>;
  findAllImages: () => Promise<IUploadImage[]>;
  findOneImageDataAndDelete: (
    postId: mongoose.Types.ObjectId
  ) => Promise<IUploadImage>;
}

const Schema = mongoose.Schema;

const imageSchema = new Schema({
  imageData: [
    {
      name: { type: String },
      url: { type: String },
    },
  ],
  postId: { type: mongoose.Types.ObjectId },
  userId: { type: mongoose.Types.ObjectId },
});

imageSchema.statics.saveImage = async function (
  imageData: IProfPic,
  userId: mongoose.Types.ObjectId,
  postId?: mongoose.Types.ObjectId
): Promise<void> {
  if (!postId) {
    const image = new ImageModel({ imageData, userId });
    await image.save();
  } else {
    const image = new ImageModel({ imageData, postId, userId });
    await image.save();
  }
};

imageSchema.statics.findAllImages = async function (): Promise<IUploadImage[]> {
  return await this.find({}).select("-__v -imageData._id");
};

imageSchema.statics.findOneImageDataAndDelete = async function (
  postId: mongoose.Types.ObjectId
): Promise<IUploadImage> {
  return await this.findOneAndDelete({
    postId,
  }).select("-__v");
};

const ImageModel: IImageModel = mongoose.model<IUploadImage, IImageModel>(
  "Image",
  imageSchema
);
export default ImageModel;

export const validate = (data: object): ValidationResult => {
  const schema: Joi.ObjectSchema = Joi.object({
    userId: Joi.string().required(),
    imageData: Joi.object({
      name: Joi.string().required(),
      url: Joi.string().required(),
    }),
  });

  return schema.validate(data);
};
