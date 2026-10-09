import type { AgentName, AgentResult } from "./types";

export type OrchestratorInput = {
  goal: string;
  affectsBalance?: boolean;
};

export type OrchestratorOutput = AgentResult<{
  summary: string;
  delegated: AgentName[];
}>;

const MONEY_EFFECT =
  /transferenc|transfer|pago|saldo|cargo|abono|cobr|d[eé]bito|cr[eé]dito|ledger/i;

export function goalAffectsBalance(input: OrchestratorInput): boolean {
  if (typeof input.affectsBalance === "boolean") {
    return input.affectsBalance;
  }
  return MONEY_EFFECT.test(input.goal);
}

export async function orchestrate(
  input: OrchestratorInput,
): Promise<OrchestratorOutput> {
  const monetary = goalAffectsBalance(input);

  return {
    agent: "orchestrator",
    requiresHumanConfirmation: monetary,
    notes: [
      "Scaffold: el orquestador aún no despacha sub-agentes. Definir el flujo en current/ antes de implementar.",
      ...(monetary
        ? [
            "La meta afecta saldo: exige confirmación explícita del titular antes de cualquier asiento.",
          ]
        : []),
    ],
    data: {
      summary: input.goal,
      delegated: [],
    },
  };
}
