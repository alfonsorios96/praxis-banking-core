import mongoose from "mongoose";
import { ensureHolderAccounts, migrateToEuro } from "@/accounts/ensure";
import { ensureHolderCards } from "@/cards/ensure";
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
let accountsPromise: Promise<void> | null = null;
let cardsPromise: Promise<void> | null = null;

function ensureSeed(): Promise<void> {
  if (!seedPromise) {
    seedPromise = seedAccess().catch((error: unknown) => {
      seedPromise = null;
      throw error;
    });
  }
  return seedPromise;
}

function ensureAccounts(): Promise<void> {
  if (!accountsPromise) {
    accountsPromise = ensureHolderAccounts().catch((error: unknown) => {
      accountsPromise = null;
      throw error;
    });
  }
  return accountsPromise;
}

function ensureCards(): Promise<void> {
  if (!cardsPromise) {
    cardsPromise = ensureHolderCards().catch((error: unknown) => {
      cardsPromise = null;
      throw error;
    });
  }
  return cardsPromise;
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
  await ensureAccounts();
  await migrateToEuro();
  await ensureCards();
  return stored.conn;
}
