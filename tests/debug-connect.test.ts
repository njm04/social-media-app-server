import mongoose from 'mongoose';
import * as testDb from './testDb';

describe('debug connect', () => {
  beforeAll(async () => {
    await testDb.connect();
  });

  afterAll(async () => {
    await testDb.closeDatabase();
  });

  it('connects', async () => {
    expect(mongoose.connection.readyState).toBe(1);
  });
});
