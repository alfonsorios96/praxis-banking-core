import { z } from "zod";

export const agentNameSchema = z.enum([
  "orchestrator",
  "identity",
  "accounts",
  "cards",
  "transfers",
  "payments",
  "ledger",
]);

export type AgentName = z.infer<typeof agentNameSchema>;

export type AgentTask<I, O> = {
  readonly name: AgentName;
  readonly mission: string;
  run(input: I): Promise<O>;
};

export type AgentResult<T> = {
  agent: AgentName;
  data: T;
  requiresHumanConfirmation: boolean;
  notes: string[];
};
