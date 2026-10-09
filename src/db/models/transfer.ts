import { Schema } from "mongoose";
import { COLLECTIONS } from "../collections";
import { defineModel } from "./define-model";

const transferSchema = new Schema(
  {
    fromAccountId: { type: String, required: true },
    toAccountId: { type: String, required: true },
    money: {
      currency: { type: String, enum: ["EUR"], required: true },
      amountMinor: { type: Number, required: true, min: 0 },
    },
    status: {
      type: String,
      enum: ["proposed", "confirmed", "rejected"],
      required: true,
    },
    idempotencyKey: { type: String, required: true, unique: true, maxlength: 128 },
  },
  { timestamps: true, collection: COLLECTIONS.transfers },
);

transferSchema.index({ fromAccountId: 1, createdAt: -1 });
transferSchema.index({ toAccountId: 1, createdAt: -1 });

export const TransferModel = defineModel("Transfer", transferSchema);
