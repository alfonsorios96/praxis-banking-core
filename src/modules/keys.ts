export const MODULE_KEYS = ["cards", "payments", "transfers"] as const;

export type ModuleKey = (typeof MODULE_KEYS)[number];

export type ModuleState = Record<ModuleKey, boolean>;

export const MODULE_PATH: Record<ModuleKey, "/tarjetas" | "/pagos" | "/transferencias"> = {
  cards: "/tarjetas",
  payments: "/pagos",
  transfers: "/transferencias",
};

export const MODULE_LABEL: Record<ModuleKey, string> = {
  cards: "Tarjetas",
  payments: "Pagos",
  transfers: "Transferencias",
};

export const ALL_MODULES_ON: ModuleState = { cards: true, payments: true, transfers: true };

export function isModuleKey(value: unknown): value is ModuleKey {
  return typeof value === "string" && (MODULE_KEYS as readonly string[]).includes(value);
}

export function moduleStateFrom(doc: Partial<Record<ModuleKey, unknown>> | null | undefined): ModuleState {
  return {
    cards: doc?.cards !== false,
    payments: doc?.payments !== false,
    transfers: doc?.transfers !== false,
  };
}

export function disabledModulePaths(state: ModuleState): string[] {
  return MODULE_KEYS.filter((key) => !state[key]).map((key) => MODULE_PATH[key]);
}

export function holdersToChange(
  states: ReadonlyMap<string, ModuleState>,
  userIds: readonly string[],
  key: ModuleKey,
  enabled: boolean,
): string[] {
  return [...new Set(userIds)].filter(
    (userId) => (states.get(userId) ?? ALL_MODULES_ON)[key] !== enabled,
  );
}
