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
