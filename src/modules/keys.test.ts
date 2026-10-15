import { describe, expect, test } from "bun:test";
import {
  ALL_MODULES_ON,
  disabledModulePaths,
  holdersToChange,
  isModuleKey,
  moduleStateFrom,
  rolloutPercent,
  rolloutStage,
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

  test("la etapa del canary sale del recuento", () => {
    expect(rolloutStage(0, 3)).toBe("off");
    expect(rolloutStage(1, 3)).toBe("canary");
    expect(rolloutStage(2, 3)).toBe("partial");
    expect(rolloutStage(3, 3)).toBe("all");
    expect(rolloutStage(1, 1)).toBe("all");
    expect(rolloutStage(0, 0)).toBe("off");
  });

  test("el porcentaje se redondea y no pasa de 100", () => {
    expect(rolloutPercent(1, 3)).toBe(33);
    expect(rolloutPercent(2, 3)).toBe(67);
    expect(rolloutPercent(3, 3)).toBe(100);
    expect(rolloutPercent(5, 3)).toBe(100);
    expect(rolloutPercent(0, 0)).toBe(0);
  });

  test("solo acepta las tres claves", () => {
    expect(isModuleKey("transfers")).toBe(true);
    expect(isModuleKey("accounts")).toBe(false);
    expect(isModuleKey(undefined)).toBe(false);
  });
});
