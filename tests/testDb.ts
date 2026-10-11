import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

const MONGOMS_VERSION = process.env.MONGOMS_VERSION ?? "7.0.14";

let mongoServer: MongoMemoryServer | undefined;

export const connect = async (): Promise<void> => {
  mongoServer = await MongoMemoryServer.create({
    binary: { version: MONGOMS_VERSION },
  });
  try {
    await mongoose.connect(mongoServer.getUri(), {
      serverSelectionTimeoutMS: 5000,
    });
  } catch (error) {
    await closeDatabase();
    throw error;
  }
};

export const closeDatabase = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.dropDatabase();
    }
  } finally {
    try {
      await mongoose.disconnect();
    } finally {
      await mongoServer?.stop();
      mongoServer = undefined;
    }
  }
};

export const clearDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 1) return;

  for (const collection of Object.values(mongoose.connection.collections)) {
    await collection.deleteMany({});
  }
};
