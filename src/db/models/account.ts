import { Schema } from "mongoose";
import { ACCOUNT_KINDS } from "@/domain/schemas";
import { COLLECTIONS } from "../collections";
import { defineModel } from "./define-model";

const accountSchema = new Schema(
  {
    ownerId: { type: String, default: null },
    kind: { type: String, enum: [...ACCOUNT_KINDS], required: true },
    label: { type: String, required: true, trim: true, maxlength: 80 },
    iban: { type: String },
    status: { type: String, enum: ["open", "frozen", "closed"], required: true },
    currency: { type: String, enum: ["EUR"], required: true },
  },
  { timestamps: true, collection: COLLECTIONS.accounts },
);

accountSchema.index({ ownerId: 1, kind: 1 }, { unique: true });
accountSchema.index(
  { iban: 1 },
  { unique: true, partialFilterExpression: { iban: { $type: "string" } } },
);

export const AccountModel = defineModel("Account", accountSchema);
