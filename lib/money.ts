const UNIT: Record<string, number> = {
  k: 1e3,
  thousand: 1e3,
  m: 1e6,
  million: 1e6,
  b: 1e9,
  billion: 1e9,
  t: 1e12,
  trillion: 1e12,
};

export interface MoneyMatch {
  amount: number;
  monthly: boolean;
}

export function parseMoney(input: string): MoneyMatch | null {
  if (!input.trim()) return null;
  const match = input
    .replace(/,/g, "")
    .match(
      /\$?\s*(\d+(?:\.\d+)?)\s*(trillion|billion|million|thousand|[tmbk])?(?![a-z])/i,
    );
  if (!match) return null;
  const value = Number(match[1]);
  if (!Number.isFinite(value)) return null;
  const unit = (match[2] ?? "").toLowerCase();
  const amount = value * (UNIT[unit] ?? 1);
  const monthly = /\/\s*(mo|month)|per\s+month/i.test(input);
  return { amount, monthly };
}

export function parsePercent(input: string): number | null {
  if (!input.trim()) return null;
  const match = input.replace(/,/g, "").match(/(\d+(?:\.\d+)?)\s*%?/);
  if (!match) return null;
  const value = Number(match[1]);
  if (!Number.isFinite(value)) return null;
  if (input.includes("%")) return value;
  if (value <= 1) return value * 100;
  return value;
}

export function formatMoney(amount: number): string {
  if (amount >= 1e12) return `$${trimNumber(amount / 1e12)}T`;
  if (amount >= 1e9) return `$${trimNumber(amount / 1e9)}B`;
  if (amount >= 1e6) return `$${trimNumber(amount / 1e6)}M`;
  if (amount >= 1e3) return `$${trimNumber(amount / 1e3)}k`;
  return `$${trimNumber(amount)}`;
}

function trimNumber(value: number): string {
  return value.toFixed(2).replace(/\.?0+$/, "");
}

export function annualized(money: MoneyMatch): number {
  return money.monthly ? money.amount * 12 : money.amount;
}
