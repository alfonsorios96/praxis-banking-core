import { describe, expect, test } from "bun:test";
import {
  ALL_MODULES_ON,
  disabledModulePaths,
  holdersToChange,
  isModuleKey,
  moduleStateFrom,
} from "./keys";

describe("estado de módulos", () => {
  test("sin fila o sin campo, el módulo está activo", () => {
    expect(moduleStateFrom(null)).toEqual(ALL_MODULES_ON);
    expect(moduleStateFrom({ payments: false })).toEqual({
      cards: true,
      payments: false,
      transfers: true,
    });
  });

  test("las rutas apagadas salen del estado", () => {
    expect(disabledModulePaths(ALL_MODULES_ON)).toEqual([]);
    expect(disabledModulePaths({ cards: false, payments: true, transfers: false })).toEqual([
      "/tarjetas",
      "/transferencias",
    ]);
  });

  test("solo cambia quien no tenía ya ese estado", () => {
    const states = new Map([
      ["sofia", { ...ALL_MODULES_ON, payments: false }],
      ["diego", ALL_MODULES_ON],
    ]);
    expect(holdersToChange(states, ["sofia", "diego", "diego"], "payments", false)).toEqual([
      "diego",
    ]);
    expect(holdersToChange(states, ["sofia", "diego", "valeria"], "payments", true)).toEqual([
      "sofia",
    ]);
  });

  test("solo acepta las tres claves", () => {
    expect(isModuleKey("transfers")).toBe(true);
    expect(isModuleKey("accounts")).toBe(false);
    expect(isModuleKey(undefined)).toBe(false);
  });
});
