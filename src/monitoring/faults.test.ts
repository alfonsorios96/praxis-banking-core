import { describe, expect, test } from "bun:test";
import { failsAtSlot, minuteBuckets, pieSlices } from "./faults";

describe("fallo simulado de emisión digital", () => {
  test("fallan exactamente 2 de cada 5 intentos", () => {
    for (let start = 1; start <= 20; start += 5) {
      const window = [0, 1, 2, 3, 4].map((step) => failsAtSlot(start + step));
      expect(window.filter(Boolean)).toHaveLength(2);
    }
  });

  test("los dos primeros intentos de cada ciclo fallan", () => {
    expect([1, 2, 3, 4, 5, 6, 7].map(failsAtSlot)).toEqual([
      true,
      true,
      false,
      false,
      false,
      true,
      true,
    ]);
  });

  test("un cupo no válido no falla", () => {
    expect(failsAtSlot(0)).toBe(false);
    expect(failsAtSlot(-1)).toBe(false);
    expect(failsAtSlot(1.5)).toBe(false);
  });
});

describe("línea de tiempo por minuto", () => {
  const now = new Date("2026-10-21T10:30:40Z");

  test("devuelve 15 cubos que acaban en el minuto actual", () => {
    const buckets = minuteBuckets([], now);
    expect(buckets).toHaveLength(15);
    expect(buckets[0]?.start.toISOString()).toBe("2026-10-21T10:16:00.000Z");
    expect(buckets[14]?.start.toISOString()).toBe("2026-10-21T10:30:00.000Z");
    expect(buckets.every((bucket) => bucket.count === 0)).toBe(true);
  });

  test("cuenta cada fallo en su minuto e ignora los de fuera", () => {
    const buckets = minuteBuckets(
      [
        new Date("2026-10-21T10:30:05Z"),
        new Date("2026-10-21T10:30:39Z"),
        new Date("2026-10-21T10:16:00Z"),
        new Date("2026-10-21T10:15:59Z"),
        new Date("2026-10-21T10:31:00Z"),
      ],
      now,
    );
    expect(buckets[14]?.count).toBe(2);
    expect(buckets[0]?.count).toBe(1);
    expect(buckets.reduce((sum, bucket) => sum + bucket.count, 0)).toBe(3);
  });
});

describe("pastel por concepto", () => {
  test("sin fallos no hay sectores", () => {
    expect(pieSlices([])).toEqual([]);
    expect(pieSlices([{ code: 500, concept: "a", count: 0 }])).toEqual([]);
  });

  test("ordena de mayor a menor y encadena los desplazamientos", () => {
    const slices = pieSlices([
      { code: 500, concept: "a", count: 1 },
      { code: 503, concept: "b", count: 3 },
    ]);
    expect(slices.map((slice) => slice.concept)).toEqual(["b", "a"]);
    expect(slices[0]).toMatchObject({ share: 0.75, offset: 0 });
    expect(slices[1]).toMatchObject({ share: 0.25, offset: 0.75 });
  });

  test("un solo concepto ocupa todo el círculo", () => {
    expect(pieSlices([{ code: 500, concept: "a", count: 4 }])).toEqual([
      { code: 500, concept: "a", count: 4, share: 1, offset: 0 },
    ]);
  });
});
