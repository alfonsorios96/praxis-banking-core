import { Types } from "mongoose";

export function isObjectId(value: string): boolean {
  if (!Types.ObjectId.isValid(value)) {
    return false;
  }
  return String(new Types.ObjectId(value)) === value;
}
