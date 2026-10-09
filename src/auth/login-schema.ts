import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Indica el usuario.").max(64),
  password: z.string().min(1, "Indica la contraseña.").max(256),
});

export type LoginFormState =
  | {
      errors?: {
        username?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

export function safeNextPath(value: FormDataEntryValue | null): string {
  if (typeof value !== "string") {
    return "/";
  }
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/login")) {
    return "/";
  }
  return value;
}
