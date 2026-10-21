import { Schema } from "mongoose";
import { CARD_KINDS, CARD_MEDIUMS, CARD_STATUSES } from "@/cards/mock";
import { COLLECTIONS } from "../collections";
import { defineModel } from "./define-model";

export const PLASTIC_ACCOUNT_INDEX = "accountId_plastic";
export const LEGACY_ACCOUNT_INDEX = "accountId_1";

const cardSchema = new Schema(
  {
    ownerId: { type: String, required: true },
    accountId: { type: String, required: true },
    medium: { type: String, enum: [...CARD_MEDIUMS], required: true, default: "plastic" },
    kind: { type: String, enum: [...CARD_KINDS], required: true },
    brand: { type: String, enum: ["visa"], required: true },
    last4: { type: String, required: true, match: /^\d{4}$/ },
    expMonth: { type: Number, required: true, min: 1, max: 12 },
    expYear: { type: Number, required: true },
    status: { type: String, enum: [...CARD_STATUSES], required: true, default: "active" },
    limitMinor: {
      type: Number,
      required: true,
      min: 0,
      validate: { validator: Number.isInteger, message: "El límite va en céntimos enteros." },
    },
  },
  { timestamps: true, collection: COLLECTIONS.cards, autoIndex: false },
);

cardSchema.index({ ownerId: 1 });
cardSchema.index(
  { accountId: 1 },
  {
    name: PLASTIC_ACCOUNT_INDEX,
    unique: true,
    partialFilterExpression: { medium: "plastic" },
  },
);

export const CardModel = defineModel("Card", cardSchema);
