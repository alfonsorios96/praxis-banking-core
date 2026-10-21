import { Schema } from "mongoose";
import { COLLECTIONS } from "../collections";
import { defineModel } from "./define-model";

const incidentSchema = new Schema(
  {
    code: { type: Number, required: true },
    concept: { type: String, required: true, maxlength: 80 },
    operation: { type: String, required: true, maxlength: 80 },
    ownerId: { type: String, required: true },
  },
  { timestamps: true, collection: COLLECTIONS.incidents },
);

incidentSchema.index({ createdAt: -1 });

export const IncidentModel = defineModel("Incident", incidentSchema);
