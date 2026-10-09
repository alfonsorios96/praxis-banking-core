import mongoose from "mongoose";
import { DB_NAME } from "./collections";
import { seedDefaultUser } from "./seed";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as typeof globalThis & {
  mongooseCache?: MongooseCache;
};

function cache(): MongooseCache {
  if (!globalForMongoose.mongooseCache) {
    globalForMongoose.mongooseCache = { conn: null, promise: null };
  }
  return globalForMongoose.mongooseCache;
}

export async function connectDb(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set.");
  }

  const stored = cache();
  if (stored.conn) {
    return stored.conn;
  }

  if (!stored.promise) {
    stored.promise = mongoose
      .connect(uri, { dbName: DB_NAME })
      .then(async (connection) => {
        await seedDefaultUser();
        return connection;
      })
      .catch((error: unknown) => {
        stored.promise = null;
        stored.conn = null;
        throw error;
      });
  }

  stored.conn = await stored.promise;
  return stored.conn;
}
