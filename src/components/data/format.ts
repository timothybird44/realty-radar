export function money(n: number): string {
  return `$${Math.round(n).toLocaleString('en-AU')}`;
}

/** $1.25m / $845k */
export function moneyShort(n: number): string {
  if (Math.abs(n) >= 1_000_000) {
    const m = n / 1_000_000;
    return `$${m.toFixed(m >= 10 ? 1 : 2).replace(/\.?0+$/, '')}m`;
  }
  return `$${Math.round(n / 1000)}k`;
}

export function signedMoneyShort(n: number): string {
  return `${n >= 0 ? '+' : '−'}${moneyShort(Math.abs(n))}`;
}

export function pct(n: number, digits = 1): string {
  return `${(n * 100).toFixed(digits)}%`;
}

export function daysAgo(iso: string, today: Date): string {
  const d = Math.round((today.getTime() - new Date(iso).getTime()) / 86_400_000);
  if (d <= 0) return 'Today';
  if (d === 1) return 'Yesterday';
  if (d < 30) return `${d} days ago`;
  const m = Math.round(d / 30.4);
  return m === 1 ? '1 month ago' : `${m} months ago`;
}

export function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}
