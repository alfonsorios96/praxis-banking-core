const CENT = 100;

export function eurosToCents(input: string): number | null {
  const normalized = normalizeEuros(input);
  if (normalized === null) {
    return null;
  }

  const [wholePart, fractionPart = ""] = normalized.split(".");
  const whole = Number(wholePart);
  const fraction = Number(fractionPart.padEnd(2, "0"));
  if (!Number.isSafeInteger(whole) || !Number.isSafeInteger(fraction)) {
    return null;
  }

  const cents = whole * CENT + fraction;
  if (!Number.isSafeInteger(cents) || cents <= 0) {
    return null;
  }

  return cents;
}

export function formatEur(cents: number): string {
  const negative = cents < 0;
  const absolute = Math.abs(cents);
  const whole = Math.floor(absolute / CENT);
  const fraction = String(absolute % CENT).padStart(2, "0");
  const grouped = String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${negative ? "-" : ""}${grouped},${fraction} €`;
}

function normalizeEuros(input: string): string | null {
  const trimmed = input.trim().replace(/\s/g, "");
  if (/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(trimmed)) {
    return trimmed.replace(/\./g, "").replace(",", ".");
  }
  if (/^\d+(,\d{1,2})?$/.test(trimmed)) {
    return trimmed.replace(",", ".");
  }
  if (/^\d+\.\d{1,2}$/.test(trimmed)) {
    return trimmed;
  }
  return null;
}
