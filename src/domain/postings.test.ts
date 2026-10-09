import { describe, expect, test } from "bun:test";
import { moneySchema } from "./schemas";
import { postingsAreBalanced } from "./postings";

const eur = (amountMinor: number) => ({ currency: "EUR" as const, amountMinor });

describe("moneySchema", () => {
  test("acepta céntimos enteros", () => {
    expect(moneySchema.safeParse(eur(1500)).success).toBe(true);
  });

  test("rechaza importes con fracción", () => {
    expect(moneySchema.safeParse(eur(10.5)).success).toBe(false);
  });
});

describe("postingsAreBalanced", () => {
  test("un asiento balanceado cuadra", () => {
    expect(
      postingsAreBalanced([
        { accountId: "a", side: "debit", money: eur(2500) },
        { accountId: "b", side: "credit", money: eur(2500) },
      ]),
    ).toBe(true);
  });

  test("un asiento desbalanceado no cuadra", () => {
    expect(
      postingsAreBalanced([
        { accountId: "a", side: "debit", money: eur(2500) },
        { accountId: "b", side: "credit", money: eur(2400) },
      ]),
    ).toBe(false);
  });
});
