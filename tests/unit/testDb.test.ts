import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import * as testDb from "../testDb";

jest.mock("mongoose", () => ({
  connect: jest.fn(),
  disconnect: jest.fn(),
  connection: {
    readyState: 0,
    dropDatabase: jest.fn(),
    collections: { users: { deleteMany: jest.fn() } },
  },
}));

describe("test database cleanup", () => {
  let server: MongoMemoryServer;

  beforeEach(() => {
    jest.replaceProperty(mongoose.connection, "readyState", 0);
    server = new MongoMemoryServer();
    jest.spyOn(server, "getUri").mockReturnValue("mongodb://127.0.0.1/test");
    jest.spyOn(server, "stop").mockResolvedValue(true);
    jest.spyOn(MongoMemoryServer, "create").mockResolvedValue(server);
  });

  afterEach(async () => {
    await testDb.closeDatabase();
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it("stops MongoDB when connecting fails and allows repeated cleanup", async () => {
    const error = new Error("Connection failed");
    jest.mocked(mongoose.connect).mockRejectedValueOnce(error);

    await expect(testDb.connect()).rejects.toThrow(error);
    await testDb.closeDatabase();

    expect(mongoose.connection.dropDatabase).not.toHaveBeenCalled();
    expect(server.stop).toHaveBeenCalledTimes(1);
  });

  it("disconnects and stops MongoDB even when dropping the database fails", async () => {
    await testDb.connect();
    jest.replaceProperty(mongoose.connection, "readyState", 1);
    const error = new Error("Drop failed");
    jest.mocked(mongoose.connection.dropDatabase).mockRejectedValueOnce(error);

    await expect(testDb.closeDatabase()).rejects.toThrow(error);

    expect(mongoose.disconnect).toHaveBeenCalled();
    expect(server.stop).toHaveBeenCalledTimes(1);
    jest.replaceProperty(mongoose.connection, "readyState", 0);
  });

  it("skips collection cleanup after a failed connection", async () => {
    await testDb.clearDatabase();

    expect(mongoose.connection.collections.users.deleteMany).not.toHaveBeenCalled();
  });
});
