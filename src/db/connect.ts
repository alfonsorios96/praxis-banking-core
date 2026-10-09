import mongoose from "mongoose";
import { ensureCurrentRelease } from "@/releases/store";
import { DB_NAME } from "./collections";
import { seedAccess } from "./seed";

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

let seedPromise: Promise<void> | null = null;

function ensureSeed(): Promise<void> {
  if (!seedPromise) {
    seedPromise = seedAccess().catch((error: unknown) => {
      seedPromise = null;
      throw error;
    });
  }
  return seedPromise;
}

export async function connectDb(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set.");
  }

  const stored = cache();
  if (!stored.conn) {
    if (!stored.promise) {
      stored.promise = mongoose.connect(uri, { dbName: DB_NAME }).catch((error: unknown) => {
        stored.promise = null;
        stored.conn = null;
        throw error;
      });
    }
    stored.conn = await stored.promise;
  }

  await ensureSeed();
  await ensureCurrentRelease();
  return stored.conn;
}
