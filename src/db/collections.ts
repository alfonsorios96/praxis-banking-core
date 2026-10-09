export const DB_NAME = process.env.MONGODB_DB?.trim() || "praxis";

export const COLLECTIONS = {
  users: "users",
  platformSettings: "platform_settings",
  releases: "releases",
  accounts: "accounts",
  transfers: "transfers",
  ledgerEntries: "ledger_entries",
} as const;
