import { Schema } from "mongoose";
import { COLLECTIONS } from "../collections";
import { defineModel } from "./define-model";

const postingSchema = new Schema(
  {
    accountId: { type: String, required: true },
    side: { type: String, enum: ["debit", "credit"], required: true },
    money: {
      currency: { type: String, enum: ["EUR"], required: true },
      amountMinor: { type: Number, required: true, min: 0 },
    },
  },
  { _id: false },
);

const ledgerEntrySchema = new Schema(
  {
    idempotencyKey: { type: String, required: true, unique: true, maxlength: 128 },
    postings: { type: [postingSchema], required: true },
  },
  { timestamps: true, collection: COLLECTIONS.ledgerEntries },
);

ledgerEntrySchema.index({ "postings.accountId": 1 });

export const LedgerEntryModel = defineModel("LedgerEntry", ledgerEntrySchema);
