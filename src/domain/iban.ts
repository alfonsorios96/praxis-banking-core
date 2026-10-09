import { createHash } from "node:crypto";

const WEIGHTS = [1, 2, 4, 8, 5, 10, 9, 7, 3, 6];

export const PRAXIS_BANK_CODE = "9090";
export const PRAXIS_BRANCH_CODE = "0001";

export function isValidSpanishIban(iban: string): boolean {
  const compact = iban.replace(/\s/g, "").toUpperCase();
  if (!/^ES\d{22}$/.test(compact)) {
    return false;
  }
  return ibanMod97(compact) === 1;
}

export function formatIban(iban: string): string {
  return iban
    .replace(/\s/g, "")
    .toUpperCase()
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

export function spanishIban(seed: string): string {
  const accountNumber = accountNumberFromSeed(seed);
  const bban = spanishBban(PRAXIS_BANK_CODE, PRAXIS_BRANCH_CODE, accountNumber);
  const check = ibanCheckDigits(bban);
  return `ES${check}${bban}`;
}

export function spanishBban(bank: string, branch: string, accountNumber: string): string {
  const first = controlDigit(`${bank}${branch}`);
  const second = controlDigit(accountNumber);
  return `${bank}${branch}${first}${second}${accountNumber}`;
}

function accountNumberFromSeed(seed: string): string {
  const hex = createHash("sha256").update(seed).digest("hex");
  const value = BigInt(`0x${hex}`) % BigInt("10000000000");
  return value.toString().padStart(10, "0");
}

function controlDigit(value: string): string {
  const padded = value.padStart(10, "0");
  let sum = 0;
  for (let index = 0; index < WEIGHTS.length; index += 1) {
    sum += Number(padded[index]) * WEIGHTS[index];
  }
  const digit = 11 - (sum % 11);
  if (digit === 11) {
    return "0";
  }
  if (digit === 10) {
    return "1";
  }
  return String(digit);
}

function ibanCheckDigits(bban: string): string {
  const remainder = ibanMod97(`ES00${bban}`);
  return String(98 - remainder).padStart(2, "0");
}

function ibanMod97(iban: string): number {
  const rearranged = `${iban.slice(4)}${iban.slice(0, 4)}`.toUpperCase();
  let remainder = 0;
  for (const character of rearranged) {
    const chunk = character >= "A" && character <= "Z" ? String(character.charCodeAt(0) - 55) : character;
    for (const digit of chunk) {
      remainder = (remainder * 10 + Number(digit)) % 97;
    }
  }
  return remainder;
}
