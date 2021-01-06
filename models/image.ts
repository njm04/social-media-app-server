import mongoose, { Document } from "mongoose";
import Joi, { ValidationResult } from "joi";

interface IUploadImage extends Document {
  name: string;
  data: string;
  postId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
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

export default mongoose.model<IUploadImage>("Image", imageSchema);
