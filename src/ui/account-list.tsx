import type { OwnedAccount } from "@/accounts/types";

export function AccountList({ accounts }: { accounts: OwnedAccount[] }) {
  const [primary, ...rest] = accounts;

  if (!primary) {
    return <p className="text-base leading-6 text-muted">Todavía no hay cuentas abiertas a tu nombre.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-muted">{primary.label}</p>
        <p className="amount mt-1">{primary.balanceLabel}</p>
        <p className="mt-2 text-sm break-all text-muted tabular-nums">{primary.ibanLabel}</p>
      </div>
      {rest.length > 0 ? (
        <ul className="divide-y divide-line border-t border-line">
          {rest.map((account) => (
            <li key={account.id} className="py-4">
              <p className="text-sm text-muted">{account.label}</p>
              <p className="amount-secondary mt-1">{account.balanceLabel}</p>
              <p className="mt-1 text-sm break-all text-muted tabular-nums">{account.ibanLabel}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
