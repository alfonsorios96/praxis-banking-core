import type { AccountKind } from "@/domain/schemas";

export const OPENING_CENTS = {
  checking: 1_000_000,
  savings: 500_000,
} as const;

export type OpeningCents = Record<keyof typeof OPENING_CENTS, number>;

export const GUEST_OPENING_CENTS: OpeningCents = {
  checking: 50_000,
  savings: OPENING_CENTS.savings,
};

export const ACCOUNT_KIND_LABEL: Record<AccountKind, string> = {
  checking: "Corriente",
  savings: "Ahorro",
  treasury: "Tesorería",
};

export function openingIdempotencyKey(accountId: string): string {
  return `opening:${accountId}`;
}
