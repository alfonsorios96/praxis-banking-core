import { readFileSync } from "node:fs";
import { join } from "node:path";

let cached: string | null = null;

export function currentBuildId(): string {
  if (cached) {
    return cached;
  }
  if (process.env.NODE_ENV !== "production") {
    cached = "development";
    return cached;
  }
  try {
    const value = readFileSync(join(process.cwd(), ".next", "BUILD_ID"), "utf8").trim();
    cached = value || "development";
  } catch {
    cached = "development";
  }
  return cached;
}
