import { describe, expect, test } from "bun:test";
import {
  ACCOUNT_KIND_LABEL,
  GUEST_OPENING_CENTS,
  OPENING_CENTS,
  openingIdempotencyKey,
} from "./opening";

describe("apertura", () => {
  test("fija céntimos y la clave de un solo alta", () => {
    expect(OPENING_CENTS.checking).toBe(1_000_000);
    expect(OPENING_CENTS.savings).toBe(500_000);
    expect(ACCOUNT_KIND_LABEL.checking).toBe("Corriente");
    expect(ACCOUNT_KIND_LABEL.savings).toBe("Ahorro");
    expect(openingIdempotencyKey("abc")).toBe("opening:abc");
  });

  test("el invitado abre la corriente con 500 € y el ahorro como el resto", () => {
    expect(GUEST_OPENING_CENTS.checking).toBe(50_000);
    expect(GUEST_OPENING_CENTS.savings).toBe(OPENING_CENTS.savings);
  });
});
