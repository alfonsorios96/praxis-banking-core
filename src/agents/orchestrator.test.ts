import { describe, expect, test } from "bun:test";
import { orchestrate } from "./orchestrator";

describe("orchestrate", () => {
  test("no pide confirmación si la meta no toca saldo", async () => {
    const result = await orchestrate({ goal: "listar las misiones de los agentes" });
    expect(result.requiresHumanConfirmation).toBe(false);
    expect(result.data.delegated).toEqual([]);
    expect(result.agent).toBe("orchestrator");
  });

  test("pide confirmación cuando el texto implica un movimiento", async () => {
    const result = await orchestrate({ goal: "hacer una transferencia a otra cuenta" });
    expect(result.requiresHumanConfirmation).toBe(true);
    expect(result.notes.some((note) => note.includes("confirmación"))).toBe(true);
  });

  test("el flag explícito manda sobre el texto", async () => {
    const forced = await orchestrate({
      goal: "consultar el perfil",
      affectsBalance: true,
    });
    const cleared = await orchestrate({
      goal: "registrar un pago",
      affectsBalance: false,
    });
    expect(forced.requiresHumanConfirmation).toBe(true);
    expect(cleared.requiresHumanConfirmation).toBe(false);
  });
});
