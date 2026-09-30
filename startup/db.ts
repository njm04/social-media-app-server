import mongoose from "mongoose";
import winston from "winston";
import config from "config";

module.exports = () => {
  const db: string = config.get("ATLAS_DB");
  mongoose
    .connect(db)
    .then(() => winston.info(`Connected to MongoDB...`))
    .catch((error) => winston.error(`MongoDB connection error: ${error.message}`));
};
