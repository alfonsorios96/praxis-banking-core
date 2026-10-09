import { Schema } from "mongoose";
import { COLLECTIONS } from "../collections";
import { defineModel } from "./define-model";

const releaseStepSchema = new Schema(
  {
    at: { type: Date, required: true },
    percent: { type: Number, required: true, min: 0, max: 100 },
  },
  { _id: false },
);

const releaseSchema = new Schema(
  {
    buildId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    percent: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    allowUserIds: {
      type: [String],
      default: [],
    },
    steps: {
      type: [releaseStepSchema],
      default: [],
    },
  },
  { timestamps: true, collection: COLLECTIONS.releases },
);

export const Release = defineModel("Release", releaseSchema);
