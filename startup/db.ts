import mongoose from "mongoose";
import winston from "winston";
import config from "config";

module.exports = () => {
  const db: string = config.get("ATLAS_DB");
  mongoose
    .connect(db, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    })
    .then(() => winston.info(`Connected to MongoDB...`));
};
