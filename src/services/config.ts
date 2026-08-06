export interface WooCommerceConfig {
  baseUrl: string;
  consumerKey: string;
  consumerSecret: string;
  timeoutMs?: number;
  // Status "pool scan": order yang menunggu dikirim, di-match oleh scanner.
  fetchStatus?: string;
  // Status untuk tab Shipments (boleh banyak, dipisah koma). Kosong -> [fetchStatus].
  fetchStatuses?: string[];
  completeStatus?: string;
}

// Semua dari environment variable, tidak ada yang hardcode.
// Node: process.env | Vite browser: import.meta.env.
function env(key: string): string {
  const node = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env?.[key];
  if (node) return node;
  return (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.[key] ?? '';
}

function parseList(value: string): string[] {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export const wooCommerceConfig: WooCommerceConfig = {
  baseUrl: env('VITE_WOO_BASE_URL'),
  consumerKey: env('VITE_WOO_CONSUMER_KEY'),
  consumerSecret: env('VITE_WOO_CONSUMER_SECRET'),
  // Status workflow toko (custom). Default bila env kosong/tidak diisi —
  // fallback mencegah URL/request berstatus kosong.
  fetchStatus: env('VITE_WOO_FETCH_STATUS') || 'processing',
  fetchStatuses: parseList(env('VITE_WOO_FETCH_STATUSES')) || undefined,
  completeStatus: env('VITE_WOO_COMPLETE_STATUS') || 'completed',
};
// ponytail: credential tidak boleh sampai ke bundle browser (production).
// Arahkan pemakaian client ini lewat server proxy bila dipanggil dari aplikasi.
