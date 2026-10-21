import { createHash } from "node:crypto";

export const CARD_KINDS = ["checking", "savings"] as const;
export type CardKind = (typeof CARD_KINDS)[number];

export const CARD_MEDIUMS = ["plastic", "digital"] as const;
export type CardMedium = (typeof CARD_MEDIUMS)[number];

export const CARD_STATUSES = ["active", "frozen", "cancelled"] as const;
export type CardStatus = (typeof CARD_STATUSES)[number];

export const TEST_BIN = "400000";

export const DAILY_LIMIT_CENTS: Record<CardKind, number> = {
  checking: 100_000,
  savings: 30_000,
};

export function isLuhnValid(digits: string): boolean {
  if (!/^\d{2,19}$/.test(digits)) {
    return false;
  }
  return luhnSum(digits) % 10 === 0;
}

export function cardNumber(seed: string): string {
  const body = `${TEST_BIN}${digitsFrom(`${seed}:pan`, 9)}`;
  const check = (10 - (luhnSum(`${body}0`) % 10)) % 10;
  return `${body}${check}`;
}

export function cardCvv(seed: string): string {
  return digitsFrom(`${seed}:cvv`, 3);
}

export function cardExpiry(seed: string, issuedYear: number): { month: number; year: number } {
  const value = Number(digitsFrom(`${seed}:exp`, 4));
  return { month: (value % 12) + 1, year: issuedYear + 3 + (value % 2) };
}

export function formatCardNumber(digits: string): string {
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

export function formatExpiry(month: number, year: number): string {
  return `${String(month).padStart(2, "0")}/${String(year % 100).padStart(2, "0")}`;
}

function digitsFrom(seed: string, length: number): string {
  const hex = createHash("sha256").update(seed).digest("hex");
  const value = BigInt(`0x${hex}`) % BigInt(10 ** length);
  return value.toString().padStart(length, "0");
}

function luhnSum(digits: string): number {
  let sum = 0;
  for (let index = 0; index < digits.length; index += 1) {
    let digit = Number(digits[digits.length - 1 - index]);
    if (index % 2 === 1) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
  }
  return sum;
}
