import mongoose, { Document, Model } from "mongoose";
import Joi, { ValidationResult } from "joi";
import { IUploadImage } from "../interfaces/image";
import { IProfPic } from "../interfaces/user";

interface IImageModel extends Model<IUploadImage> {
  saveImage: (
    imageData: IProfPic,
    userId: mongoose.Types.ObjectId
  ) => Promise<void>;
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
  userId: mongoose.Types.ObjectId
): Promise<void> {
  const image = new ImageModel({ imageData, userId });
  await image.save();
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
