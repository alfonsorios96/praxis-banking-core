import { Schema } from "mongoose";
import { COLLECTIONS } from "../collections";
import { defineModel } from "./define-model";

const deviceTokenSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    token: { type: String, required: true, unique: true },
  },
  { timestamps: true, collection: COLLECTIONS.deviceTokens },
);

export const DeviceTokenModel = defineModel("DeviceToken", deviceTokenSchema);
