import { describe, expect, test } from "bun:test";
import {
  cardCvv,
  cardExpiry,
  cardNumber,
  formatCardNumber,
  formatExpiry,
  isLuhnValid,
  TEST_BIN,
} from "./mock";

describe("tarjeta simulada", () => {
  test("el número es de prueba, de 16 dígitos y pasa Luhn", () => {
    for (const seed of ["a", "665f1c2b9d3e4a0012345678", "otra-cuenta"]) {
      const number = cardNumber(seed);
      expect(number).toMatch(/^\d{16}$/);
      expect(number.startsWith(TEST_BIN)).toBe(true);
      expect(isLuhnValid(number)).toBe(true);
    }
  });

  test("la misma semilla da los mismos datos y otra semilla no", () => {
    expect(cardNumber("cuenta-1")).toBe(cardNumber("cuenta-1"));
    expect(cardCvv("cuenta-1")).toBe(cardCvv("cuenta-1"));
    expect(cardNumber("cuenta-1")).not.toBe(cardNumber("cuenta-2"));
  });

  test("los últimos 4 salen del mismo número", () => {
    const number = cardNumber("cuenta-1");
    expect(formatCardNumber(number).slice(-4)).toBe(number.slice(-4));
  });

  test("Luhn rechaza un dígito cambiado y texto", () => {
    const number = cardNumber("cuenta-1");
    const last = Number(number.at(-1));
    expect(isLuhnValid(`${number.slice(0, -1)}${(last + 1) % 10}`)).toBe(false);
    expect(isLuhnValid("4000 0000")).toBe(false);
  });

  test("CVV, caducidad y formato", () => {
    expect(cardCvv("cuenta-1")).toMatch(/^\d{3}$/);
    const expiry = cardExpiry("cuenta-1", 2026);
    expect(expiry.month).toBeGreaterThanOrEqual(1);
    expect(expiry.month).toBeLessThanOrEqual(12);
    expect([2029, 2030]).toContain(expiry.year);
    expect(formatExpiry(3, 2029)).toBe("03/29");
    expect(formatCardNumber("4000001234567899")).toBe("4000 0012 3456 7899");
  });
});
