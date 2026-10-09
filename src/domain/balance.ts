export type BalancePosting = {
  accountId: string;
  side: "debit" | "credit";
  amountMinor: number;
};

export function accountBalanceMinor(postings: BalancePosting[], accountId: string): number {
  let balance = 0;

  for (const posting of postings) {
    if (posting.accountId !== accountId) {
      continue;
    }
    if (!Number.isInteger(posting.amountMinor)) {
      continue;
    }
    balance += posting.side === "credit" ? posting.amountMinor : -posting.amountMinor;
  }

  return balance;
}
