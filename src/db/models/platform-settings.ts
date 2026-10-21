import { Schema } from "mongoose";
import { COLLECTIONS } from "../collections";
import { defineModel } from "./define-model";

export const PLATFORM_SETTINGS_KEY = "default";
export const DEFAULT_DISPLAY_NAME = "Praxis";

const platformSettingsSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 40,
    },
    simulateDigitalCardFaults: { type: Boolean, default: true },
    digitalIssuanceSlot: {
      type: Number,
      default: 0,
      min: 0,
      validate: { validator: Number.isInteger, message: "El cupo es un entero." },
    },
  },
  { timestamps: true, collection: COLLECTIONS.platformSettings },
);

export const PlatformSettings = defineModel("PlatformSettings", platformSettingsSchema);

export async function ensurePlatformSettings(): Promise<void> {
  await PlatformSettings.updateOne(
    { key: PLATFORM_SETTINGS_KEY },
    {
      $setOnInsert: {
        key: PLATFORM_SETTINGS_KEY,
        displayName: DEFAULT_DISPLAY_NAME,
      },
    },
    { upsert: true },
  );
}

export async function readPlatformSettings(): Promise<{ displayName: string }> {
  const doc = await PlatformSettings.findOne({ key: PLATFORM_SETTINGS_KEY }).lean();
  const displayName =
    doc &&
    typeof doc.displayName === "string" &&
    doc.displayName.trim().length >= 2
      ? doc.displayName.trim()
      : DEFAULT_DISPLAY_NAME;
  return { displayName };
}

export async function readFaultSimulation(): Promise<boolean> {
  const doc = await PlatformSettings.findOne({ key: PLATFORM_SETTINGS_KEY })
    .select("simulateDigitalCardFaults")
    .lean();
  return doc?.simulateDigitalCardFaults !== false;
}

export async function setFaultSimulation(enabled: boolean): Promise<void> {
  await PlatformSettings.updateOne(
    { key: PLATFORM_SETTINGS_KEY },
    {
      $set: { simulateDigitalCardFaults: enabled },
      $setOnInsert: { key: PLATFORM_SETTINGS_KEY, displayName: DEFAULT_DISPLAY_NAME },
    },
    { upsert: true },
  );
}

export async function takeDigitalIssuanceSlot(): Promise<number> {
  await ensurePlatformSettings();
  const doc = await PlatformSettings.findOneAndUpdate(
    { key: PLATFORM_SETTINGS_KEY },
    { $inc: { digitalIssuanceSlot: 1 } },
    { returnDocument: "after" },
  )
    .select("digitalIssuanceSlot")
    .lean();
  return Number(doc?.digitalIssuanceSlot ?? 0);
}
