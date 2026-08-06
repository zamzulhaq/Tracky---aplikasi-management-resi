// Derivation murni untuk progress counter (PRD Req-1.3: "0/12 Paket Verified").
// Context memakai ini; logika tetap bisa di-self-check tanpa React.
export function computeProgressPercent(verified: number, total: number | null): number {
  if (!total || total <= 0) return 0;
  return Math.round((verified / total) * 100);
}

export function computeIsCompleted(verified: number, total: number | null): boolean {
  return total !== null && total > 0 && verified >= total;
}
