import type { LedgerEntry } from "./schemas";

export function postingsAreBalanced(postings: LedgerEntry["postings"]): boolean {
  if (postings.length < 2) {
    return false;
  }

  let debit = 0;
  let credit = 0;

  for (const posting of postings) {
    if (!Number.isInteger(posting.money.amountMinor)) {
      return false;
    }
    if (posting.money.currency !== "EUR") {
      return false;
    }
    if (posting.side === "debit") {
      debit += posting.money.amountMinor;
    } else {
      credit += posting.money.amountMinor;
    }
  }

  return debit === credit;
}
