import { describe, expect, test } from "bun:test";
import { guestInitials, guestNameSchema, guestUsername, nextGuestNumber } from "./guest";

describe("iniciales del invitado", () => {
  test("toma la primera letra de cada palabra, sin acentos", () => {
    expect(guestInitials("María Ana Ruiz Mendoza")).toBe("marm");
    expect(guestInitials("Sofía Herrera")).toBe("sh");
    expect(guestInitials("Íñigo")).toBe("i");
  });

  test("cuenta las partículas y corta en cuatro letras", () => {
    expect(guestInitials("José del Río")).toBe("jdr");
    expect(guestInitials("Ana Belén de la Cruz Pérez")).toBe("abdl");
  });

  test("ignora signos, espacios y palabras que no empiezan por letra", () => {
    expect(guestInitials("  ana-maría   o'neil ")).toBe("amon");
    expect(guestInitials("Juan 2")).toBe("j");
    expect(guestInitials("123 !!")).toBe("");
  });
});

describe("usuario del invitado", () => {
  test("rellena el consecutivo a tres dígitos", () => {
    expect(guestUsername("marm", 1)).toBe("demo-marm-001");
    expect(guestUsername("sh", 42)).toBe("demo-sh-042");
    expect(guestUsername("sh", 1000)).toBe("demo-sh-1000");
  });

  test("sigue al mayor número del mismo prefijo", () => {
    expect(nextGuestNumber("marm", [])).toBe(1);
    expect(nextGuestNumber("marm", ["demo-marm-001", "demo-marm-007", "demo-marm-003"])).toBe(8);
  });

  test("no mezcla prefijos que empiezan igual", () => {
    expect(nextGuestNumber("ma", ["demo-marm-005", "demo-ma-002", "demo-ma-x"])).toBe(3);
  });
});

describe("nombre del invitado", () => {
  test("pide un nombre con letras", () => {
    expect(guestNameSchema.safeParse({ name: "  " }).success).toBe(false);
    expect(guestNameSchema.safeParse({ name: "123" }).success).toBe(false);
    expect(guestNameSchema.safeParse({ name: "María" }).success).toBe(true);
  });
});
