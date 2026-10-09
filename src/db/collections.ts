export const DB_NAME = process.env.MONGODB_DB?.trim() || "praxis";

export const COLLECTIONS = {
  users: "users",
  platformSettings: "platform_settings",
  releases: "releases",
} as const;
