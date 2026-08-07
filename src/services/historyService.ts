import { HistoryEntry } from './syncTypes';

// Local History (PRD Sprint 12): Firebase dihapus, semua di localStorage.
// Key tunggal: tracky_scan_history. Entri > 30 hari otomatis dibuang saat save.

const STORAGE_KEY = 'tracky_scan_history';
const RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

// Simpan setelah sync sukses (dipanggil syncService). Prune entri > 30 hari.
export function saveHistoryEntry(entry: HistoryEntry): void {
  const cutoff = Date.now() - RETENTION_MS;
  const kept = loadHistory().filter((e) => Date.parse(e.timestamp) >= cutoff);
  kept.push(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(kept));
}

export interface HistorySection {
  label: string;
  entries: HistoryEntry[];
}

// Kelompokkan history: Hari Ini / Kemarin / 1 Minggu Lalu / Lebih Lama.
export function groupHistory(entries: HistoryEntry[]): HistorySection[] {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startTs = startOfToday.getTime();
  const DAY = 24 * 60 * 60 * 1000;

  const buckets: Record<string, HistoryEntry[]> = {
    'Hari Ini': [],
    Kemarin: [],
    '1 Minggu Lalu': [],
    'Lebih Lama': [],
  };
  const sorted = [...entries].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));

  for (const e of sorted) {
    const t = Date.parse(e.timestamp);
    if (t >= startTs) buckets['Hari Ini'].push(e);
    else if (t >= startTs - DAY) buckets['Kemarin'].push(e);
    else if (t >= startTs - 7 * DAY) buckets['1 Minggu Lalu'].push(e);
    else buckets['Lebih Lama'].push(e);
  }

  return Object.entries(buckets)
    .filter(([, list]) => list.length > 0)
    .map(([label, list]) => ({ label, entries: list }));
}
