import { describe, expect, test } from "bun:test";
import { eurosToCents, formatEur } from "./money";

describe("eurosToCents", () => {
  test("convierte euros con coma decimal", () => {
    expect(eurosToCents("10")).toBe(1000);
    expect(eurosToCents("10,5")).toBe(1050);
    expect(eurosToCents("10,50")).toBe(1050);
    expect(eurosToCents("10.000,50")).toBe(1_000_050);
    expect(eurosToCents("10.50")).toBe(1050);
  });

  test("rechaza cero, más de dos decimales y texto", () => {
    expect(eurosToCents("0")).toBeNull();
    expect(eurosToCents("0,00")).toBeNull();
    expect(eurosToCents("10,505")).toBeNull();
    expect(eurosToCents("-1")).toBeNull();
    expect(eurosToCents("")).toBeNull();
  });
});

describe("formatEur", () => {
  test("muestra céntimos con coma y símbolo de euro", () => {
    expect(formatEur(1_000_000)).toBe("10.000,00 €");
    expect(formatEur(500_000)).toBe("5.000,00 €");
    expect(formatEur(1050)).toBe("10,50 €");
    expect(formatEur(-50)).toBe("-0,50 €");
  });
});
