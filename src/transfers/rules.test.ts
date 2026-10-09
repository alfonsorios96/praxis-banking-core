import { describe, expect, test } from "bun:test";
import { denyTransfer } from "./rules";

const allowed = {
  actorId: "sofia",
  actorIsHolder: true,
  recipientId: "diego",
  recipientIsHolder: true,
  sourceOwnerId: "sofia",
  sourceOpen: true,
  destinationOpen: true,
  amountMinor: 10_000,
  sourceBalanceMinor: 1_000_000,
};

describe("denyTransfer", () => {
  test("acepta un traspaso cubierto por el saldo", () => {
    expect(denyTransfer(allowed)).toBeNull();
    expect(denyTransfer({ ...allowed, amountMinor: allowed.sourceBalanceMinor })).toBeNull();
  });

  test("rechaza importe cero, origen ajeno, uno mismo, no titular, cuenta cerrada y saldo corto", () => {
    expect(denyTransfer({ ...allowed, amountMinor: 0 })).toBe("amount");
    expect(denyTransfer({ ...allowed, sourceOwnerId: "diego" })).toBe("source");
    expect(denyTransfer({ ...allowed, recipientId: "sofia" })).toBe("self");
    expect(denyTransfer({ ...allowed, recipientIsHolder: false })).toBe("recipient");
    expect(denyTransfer({ ...allowed, destinationOpen: false })).toBe("closed");
    expect(denyTransfer({ ...allowed, sourceOpen: false })).toBe("closed");
    expect(denyTransfer({ ...allowed, amountMinor: allowed.sourceBalanceMinor + 1 })).toBe("funds");
  });
});
