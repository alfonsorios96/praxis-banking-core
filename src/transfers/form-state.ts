export type TransferDraft = {
  fromAccountId: string;
  recipientUserId: string;
  amountMinor: number;
  idempotencyKey: string;
  fromLabel: string;
  fromIban: string;
  recipientLabel: string;
  toIban: string;
  amountLabel: string;
};

export type TransferFieldValues = {
  fromAccountId: string;
  recipientUserId: string;
  amount: string;
};

export type TransferActionState = {
  step: "edit" | "review";
  error?: string;
  values?: TransferFieldValues;
  draft?: TransferDraft;
};
