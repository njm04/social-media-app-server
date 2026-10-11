import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

describe('debug direct', () => {
  it('connects to mongo memory server directly', async () => {
    const mongoServer = await MongoMemoryServer.create({ binary: { version: '7.0.14' } });
    try {
      await mongoose.connect(mongoServer.getUri(), { serverSelectionTimeoutMS: 5000 });
      expect(mongoose.connection.readyState).toBe(1);
    } finally {
      try {
        await mongoose.disconnect();
      } finally {
        await mongoServer.stop();
      }
    }
  });
});
