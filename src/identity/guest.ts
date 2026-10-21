import { z } from "zod";
import type { ModuleState } from "@/modules/keys";

export const GUEST_PASSWORD = "Praxis123!";

export const GUEST_MODULES: ModuleState = { cards: false, payments: false, transfers: true };

const MAX_INITIALS = 4;
const PREFIX = "demo-";

export const guestNameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Escribe tu nombre.")
    .max(120, "Usa como máximo 120 caracteres.")
    .refine((value) => guestInitials(value).length > 0, "Escribe un nombre con letras."),
});

export type GuestFormState =
  | {
      errors?: { name?: string[] };
      message?: string;
      name?: string;
    }
  | undefined;

export function guestInitials(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => /^[a-z]/.test(word))
    .map((word) => word[0])
    .slice(0, MAX_INITIALS)
    .join("");
}

export function guestUsername(initials: string, number: number): string {
  return `${guestPrefix(initials)}${String(number).padStart(3, "0")}`;
}

export function guestPrefix(initials: string): string {
  return `${PREFIX}${initials}-`;
}

export function nextGuestNumber(initials: string, usernames: readonly string[]): number {
  const prefix = guestPrefix(initials);
  let highest = 0;
  for (const username of usernames) {
    if (!username.startsWith(prefix)) {
      continue;
    }
    const suffix = username.slice(prefix.length);
    if (/^\d+$/.test(suffix)) {
      highest = Math.max(highest, Number(suffix));
    }
  }
  return highest + 1;
}
