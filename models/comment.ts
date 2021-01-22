import mongoose, { Document } from "mongoose";
import Joi, { ValidationResult } from "joi";

interface ICreatedBy {
  _id: string;
  firstName: string;
  lastName: string;
  fullName: string;
}

export interface IComment extends Document {
  post: string;
  comment: string;
  createdBy: ICreatedBy;
}

const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    comment: { type: String, Required: true },
    createdBy: {
      type: new Schema({
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        fullName: { type: String, required: true },
      }),
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const validate = (comment: object): ValidationResult => {
  const schema: Joi.ObjectSchema<IComment> = Joi.object({
    post: Joi.string().required(),
    comment: Joi.string().required(),
    userId: Joi.string().required(),
  });

  return schema.validate(comment);
};

export default mongoose.model<IComment>("Comment", commentSchema);
