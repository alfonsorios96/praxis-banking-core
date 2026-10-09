import { describe, expect, test } from "bun:test";
import { moneySchema } from "./schemas";
import { postingsAreBalanced } from "./postings";

const mxn = (amountMinor: number) => ({ currency: "MXN" as const, amountMinor });

describe("moneySchema", () => {
  test("acepta centavos enteros", () => {
    expect(moneySchema.safeParse(mxn(1500)).success).toBe(true);
  });

  test("rechaza importes con fracción", () => {
    expect(moneySchema.safeParse(mxn(10.5)).success).toBe(false);
  });
});

describe("postingsAreBalanced", () => {
  test("un asiento balanceado cuadra", () => {
    expect(
      postingsAreBalanced([
        { accountId: "a", side: "debit", money: mxn(2500) },
        { accountId: "b", side: "credit", money: mxn(2500) },
      ]),
    ).toBe(true);
  });

  test("un asiento desbalanceado no cuadra", () => {
    expect(
      postingsAreBalanced([
        { accountId: "a", side: "debit", money: mxn(2500) },
        { accountId: "b", side: "credit", money: mxn(2400) },
      ]),
    ).toBe(false);
  });
});
