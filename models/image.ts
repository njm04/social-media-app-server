import mongoose, { Document } from "mongoose";
import Joi, { ValidationResult } from "joi";

interface IUploadImage extends Document {
  name: string;
  data: string;
  postId?: mongoose.Types.ObjectId;
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
});

export default mongoose.model<IUploadImage>("Image", imageSchema);
