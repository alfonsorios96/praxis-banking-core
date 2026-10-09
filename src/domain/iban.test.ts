import { describe, expect, test } from "bun:test";
import { formatIban, isValidSpanishIban, spanishBban, spanishIban } from "./iban";

describe("IBAN español", () => {
  test("reconoce un IBAN de referencia y su CCC", () => {
    expect(isValidSpanishIban("ES9121000418450200051332")).toBe(true);
    expect(spanishBban("2100", "0418", "0200051332")).toBe("21000418450200051332");
  });

  test("genera un IBAN estable de Praxis", () => {
    const iban = spanishIban("sofia:checking");
    expect(iban).toHaveLength(24);
    expect(iban.startsWith("ES")).toBe(true);
    expect(iban.slice(4, 12)).toBe("90900001");
    expect(isValidSpanishIban(iban)).toBe(true);
    expect(spanishIban("sofia:checking")).toBe(iban);
    expect(spanishIban("sofia:savings")).not.toBe(iban);
  });

  test("formatea en grupos de cuatro", () => {
    expect(formatIban("ES9121000418450200051332")).toBe("ES91 2100 0418 4502 0005 1332");
  });
});
