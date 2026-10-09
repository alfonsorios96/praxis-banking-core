export type TransferDenial = "amount" | "self" | "source" | "recipient" | "closed" | "funds";

export function denyTransfer(input: {
  actorId: string;
  actorIsHolder: boolean;
  recipientId: string;
  recipientIsHolder: boolean;
  sourceOwnerId: string | null;
  sourceOpen: boolean;
  destinationOpen: boolean;
  amountMinor: number;
  sourceBalanceMinor: number;
}): TransferDenial | null {
  if (!Number.isInteger(input.amountMinor) || input.amountMinor <= 0) {
    return "amount";
  }
  if (!input.actorIsHolder || input.sourceOwnerId !== input.actorId) {
    return "source";
  }
  if (input.actorId === input.recipientId) {
    return "self";
  }
  if (!input.recipientIsHolder) {
    return "recipient";
  }
  if (!input.sourceOpen || !input.destinationOpen) {
    return "closed";
  }
  if (input.sourceBalanceMinor < input.amountMinor) {
    return "funds";
  }
  return null;
}

export const TRANSFER_DENIAL_MESSAGE: Record<TransferDenial, string> = {
  amount: "El importe tiene que ser mayor que cero, en euros y con hasta dos decimales.",
  self: "No puedes transferirte a ti mismo.",
  source: "Elige una de tus cuentas abiertas.",
  recipient: "El destinatario tiene que ser otro cuentahabiente.",
  closed: "La cuenta no está abierta.",
  funds: "No hay saldo suficiente.",
};
