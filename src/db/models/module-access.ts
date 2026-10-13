import { Schema } from "mongoose";
import { COLLECTIONS } from "../collections";
import { defineModel } from "./define-model";

const moduleAccessSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    cards: { type: Boolean, default: true },
    payments: { type: Boolean, default: true },
    transfers: { type: Boolean, default: true },
  },
  { timestamps: true, collection: COLLECTIONS.moduleAccess },
);

export const ModuleAccessModel = defineModel("ModuleAccess", moduleAccessSchema);
