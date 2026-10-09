import { Schema } from "mongoose";
import { USER_ROLES, type UserRole } from "@/domain/schemas";
import { COLLECTIONS } from "../collections";
import { defineModel } from "./define-model";

export type UserRecord = {
  username: string;
  fullName: string;
  passwordHash: string;
  role: UserRole;
};

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 2,
      maxlength: 64,
    },
    fullName: {
      type: String,
      default: "",
      trim: true,
      maxlength: 120,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: [...USER_ROLES],
      required: true,
    },
  },
  { timestamps: true, collection: COLLECTIONS.users },
);

export const User = defineModel("User", userSchema);
