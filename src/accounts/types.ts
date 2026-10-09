export type OwnedAccount = {
  id: string;
  kind: "checking" | "savings";
  label: string;
  ibanLabel: string;
  balanceLabel: string;
};

export type TransferRecipient = {
  id: string;
  label: string;
  ibanLabel: string;
};
