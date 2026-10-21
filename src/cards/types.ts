export type OwnedCard = {
  id: string;
  kind: "checking" | "savings";
  accountLabel: string;
  balanceLabel: string;
  last4: string;
  numberLabel: string;
  expLabel: string;
  cvv: string;
  holderName: string;
  status: "active" | "frozen" | "cancelled";
  limitLabel: string;
};
