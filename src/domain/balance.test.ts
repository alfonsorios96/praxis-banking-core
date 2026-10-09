import { describe, expect, test } from "bun:test";
import { accountBalanceMinor } from "./balance";

describe("accountBalanceMinor", () => {
  test("el saldo del titular es créditos menos débitos", () => {
    const postings = [
      { accountId: "cheques", side: "credit" as const, amountMinor: 1_000_000 },
      { accountId: "tesoreria", side: "debit" as const, amountMinor: 1_000_000 },
      { accountId: "cheques", side: "debit" as const, amountMinor: 25_000 },
      { accountId: "ajena", side: "credit" as const, amountMinor: 25_000 },
    ];

    expect(accountBalanceMinor(postings, "cheques")).toBe(975_000);
    expect(accountBalanceMinor(postings, "ajena")).toBe(25_000);
  });
});
