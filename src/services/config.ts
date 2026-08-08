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

// ===========================================================================
// Runtime credentials (Profile): pengguna bisa mengubah API key di dalam app
// tanpa rebuild. Disimpan di localStorage; jika ada, MENANG atas nilai .env.
// Key: 'tracky_woo_credentials' = JSON { baseUrl, consumerKey, consumerSecret }.
// ===========================================================================
const CREDENTIALS_KEY = 'tracky_woo_credentials';

export interface RuntimeCredentials {
  baseUrl: string;
  consumerKey: string;
  consumerSecret: string;
}

export function getSavedCredentials(): RuntimeCredentials | null {
  try {
    const raw = localStorage.getItem(CREDENTIALS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<RuntimeCredentials>;
    if (!parsed.baseUrl && !parsed.consumerKey && !parsed.consumerSecret) return null;
    return {
      baseUrl: parsed.baseUrl ?? '',
      consumerKey: parsed.consumerKey ?? '',
      consumerSecret: parsed.consumerSecret ?? '',
    };
  } catch {
    return null;
  }
}

export function saveCredentials(c: RuntimeCredentials): void {
  localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(c));
}

export function clearCredentials(): void {
  localStorage.removeItem(CREDENTIALS_KEY);
}

// WooCommerce v3 selalu di bawah /wp-json/wc/v3; tambahkan otomatis bila
// pengguna hanya mengetik domain (mis. https://azrahstore.com).
export function normalizeBaseUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;
  // Tanpa skema (mis. "azrahstore.com") akan menjadi URL relatif dan fetch
  // salah sasaran -> balasan HTML bukan JSON. Paksa https://.
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  if (/\/wp-json\/wc\/v3\/?$/.test(withScheme)) return withScheme.replace(/\/$/, '');
  return `${withScheme.replace(/\/$/, '')}/wp-json/wc/v3`;
}

// Tampilkan base URL hanya sampai host (potong path /wp-json/wc/v3).
export function displayOrigin(baseUrl: string): string {
  try {
    return new URL(baseUrl).origin;
  } catch {
    return baseUrl;
  }
}

export const wooCommerceConfig: WooCommerceConfig = {
  // Credential HANYA dari Profile (localStorage). Tidak ada fallback env:
  // Vite meng-inline import.meta.env.VITE_* ke bundle saat build, sehingga
  // fallback env membuat consumer key/secret ikut tertanam di APK.
  baseUrl: (getSavedCredentials()?.baseUrl || env('VITE_WOO_BASE_URL')),
  consumerKey: getSavedCredentials()?.consumerKey || '',
  consumerSecret: getSavedCredentials()?.consumerSecret || '',
  // Status workflow toko (custom). Default bila env kosong/tidak diisi —
  // fallback mencegah URL/request berstatus kosong.
  fetchStatus: env('VITE_WOO_FETCH_STATUS') || 'processing',
  fetchStatuses: parseList(env('VITE_WOO_FETCH_STATUSES')) || undefined,
  completeStatus: env('VITE_WOO_COMPLETE_STATUS') || 'completed',
};
// ponytail: credential tidak boleh sampai ke bundle browser (production).
// Arahkan pemakaian client ini lewat server proxy bila dipanggil dari aplikasi.
