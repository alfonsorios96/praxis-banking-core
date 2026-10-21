export const DB_NAME = process.env.MONGODB_DB?.trim() || "praxis";

export const COLLECTIONS = {
  users: "users",
  platformSettings: "platform_settings",
  accounts: "accounts",
  transfers: "transfers",
  ledgerEntries: "ledger_entries",
  deviceTokens: "device_tokens",
  moduleAccess: "module_access",
  cards: "cards",
  incidents: "incidents",
} as const;
