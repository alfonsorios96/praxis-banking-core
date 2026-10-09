import type { AgentName } from "./types";

export const AGENT_MISSIONS: Record<AgentName, string> = {
  orchestrator:
    "Descomponer peticiones, asignar sub-agentes y consolidar un resultado trazable. Pedir confirmación del titular si la meta afecta un saldo.",
  identity: "Usuarios, credenciales y perfil. No abre cuentas ni mueve dinero.",
  accounts:
    "Cuentas, titularidad y estado. No muta saldos.",
  cards: "Plástico, estado y límites. No autoriza cargos.",
  transfers:
    "Proponer traspasos entre cuentas. No escribe asientos.",
  payments:
    "Proponer pagos a un comercio o servicio. No escribe asientos.",
  ledger:
    "Única escritura de asientos. El saldo se deriva de ellos.",
};

export const SUBAGENTS: Exclude<AgentName, "orchestrator">[] = [
  "identity",
  "accounts",
  "cards",
  "transfers",
  "payments",
  "ledger",
];
