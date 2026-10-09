import { z } from "zod";

export const currencySchema = z.literal("MXN");

export const moneySchema = z.object({
  currency: currencySchema,
  amountMinor: z.number().int().nonnegative(),
});

export type Money = z.infer<typeof moneySchema>;

export const USER_ROLES = ["administrador", "cuentahabiente"] as const;

export const userRoleSchema = z.enum(USER_ROLES);

export type UserRole = (typeof USER_ROLES)[number];

export const identitySchema = z.object({
  id: z.string().min(1),
  username: z.string().trim().min(2).max(64),
  fullName: z.string().trim().max(120),
  role: userRoleSchema,
});

export const accountStatusSchema = z.enum(["open", "frozen", "closed"]);

export const accountSchema = z.object({
  id: z.string().min(1),
  ownerId: z.string().min(1),
  label: z.string().trim().min(1).max(80),
  status: accountStatusSchema,
  currency: currencySchema,
});

export const cardStatusSchema = z.enum(["active", "frozen", "cancelled"]);

export const cardSchema = z.object({
  id: z.string().min(1),
  accountId: z.string().min(1),
  last4: z.string().regex(/^\d{4}$/),
  status: cardStatusSchema,
  limitMinor: z.number().int().nonnegative(),
});

export const movementStatusSchema = z.enum(["proposed", "confirmed", "rejected"]);

export const transferSchema = z.object({
  id: z.string().min(1),
  fromAccountId: z.string().min(1),
  toAccountId: z.string().min(1),
  money: moneySchema,
  status: movementStatusSchema,
  idempotencyKey: z.string().trim().min(1).max(128),
});

export const paymentSchema = z.object({
  id: z.string().min(1),
  accountId: z.string().min(1),
  payee: z.string().trim().min(1).max(120),
  money: moneySchema,
  status: movementStatusSchema,
  idempotencyKey: z.string().trim().min(1).max(128),
});

export const postingSideSchema = z.enum(["debit", "credit"]);

export const ledgerPostingSchema = z.object({
  accountId: z.string().min(1),
  side: postingSideSchema,
  money: moneySchema,
});

export const ledgerEntrySchema = z.object({
  id: z.string().min(1),
  idempotencyKey: z.string().trim().min(1).max(128),
  postings: z.array(ledgerPostingSchema).min(2),
});

export type Identity = z.infer<typeof identitySchema>;
export type Account = z.infer<typeof accountSchema>;
export type Card = z.infer<typeof cardSchema>;
export type Transfer = z.infer<typeof transferSchema>;
export type Payment = z.infer<typeof paymentSchema>;
export type LedgerEntry = z.infer<typeof ledgerEntrySchema>;
