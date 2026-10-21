export const FAULT_CYCLE = 5;
export const FAILING_SLOTS: readonly number[] = [1, 2];

export const DIGITAL_ISSUANCE_OPERATION = "emitir-tarjeta-digital";

export const DIGITAL_ISSUANCE_FAULT = {
  code: 500,
  concept: "emisor-virtual-no-responde",
  label: "El emisor virtual no respondió al aprovisionar el PAN digital",
} as const;

export const CONCEPT_LABEL: Record<string, string> = {
  [DIGITAL_ISSUANCE_FAULT.concept]: DIGITAL_ISSUANCE_FAULT.label,
};

export const TIMELINE_MINUTES = 15;

const MINUTE_MS = 60_000;

/** Slots count from 1. Two of every five slots fail. */
export function failsAtSlot(slot: number): boolean {
  if (!Number.isInteger(slot) || slot < 1) {
    return false;
  }
  return FAILING_SLOTS.includes(slot % FAULT_CYCLE);
}

export type MinuteBucket = { start: Date; count: number };

export function minuteBuckets(
  times: readonly Date[],
  now: Date,
  minutes: number = TIMELINE_MINUTES,
): MinuteBucket[] {
  const last = Math.floor(now.getTime() / MINUTE_MS) * MINUTE_MS;
  const first = last - (minutes - 1) * MINUTE_MS;
  const buckets = Array.from({ length: minutes }, (_, index) => ({
    start: new Date(first + index * MINUTE_MS),
    count: 0,
  }));
  for (const time of times) {
    const index = Math.floor((time.getTime() - first) / MINUTE_MS);
    const bucket = buckets[index];
    if (bucket) {
      bucket.count += 1;
    }
  }
  return buckets;
}

export type ConceptCount = { code: number; concept: string; count: number };
export type PieSlice = ConceptCount & { share: number; offset: number };

export function pieSlices(rows: readonly ConceptCount[]): PieSlice[] {
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  if (total === 0) {
    return [];
  }
  let offset = 0;
  return [...rows]
    .filter((row) => row.count > 0)
    .sort((left, right) => right.count - left.count)
    .map((row) => {
      const share = row.count / total;
      const slice = { ...row, share, offset };
      offset += share;
      return slice;
    });
}
