import assert from 'node:assert';
import { groupHistory, saveHistoryEntry } from './historyService';
import { HistoryEntry } from './syncTypes';

function entry(ts: string): HistoryEntry {
  return {
    mode: 'ORDER',
    orderId: '68408',
    customerName: 'Syahdini Handiani',
    trackingNumber: '68408',
    statusBefore: 'sudah-lunas',
    statusAfter: 'sudah-dikirim',
    timestamp: ts,
    success: true,
  };
}

function main() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0).toISOString();
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 12, 0, 0).toISOString();
  const threeDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3, 12, 0, 0).toISOString();
  const tenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 10, 12, 0, 0).toISOString();
  const old = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 40, 12, 0, 0).toISOString();

  // Grouping 4 bucket sesuai urutan.
  const groups = groupHistory([entry(old), entry(tenDaysAgo), entry(threeDaysAgo), entry(yesterday), entry(today)]);
  assert.deepEqual(groups.map((g) => g.label), ['Hari Ini', 'Kemarin', '1 Minggu Lalu', 'Lebih Lama']);
  assert.equal(groups[0].entries.length, 1);
  assert.equal(groups[1].entries.length, 1);
  assert.equal(groups[2].entries.length, 1); // 3 hari lalu (< 7 hari)
  assert.equal(groups[3].entries.length, 2); // 10 hari + 40 hari (> 7 hari)

  // Urutan desc dalam satu bucket.
  const sameDay = [entry(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8).toISOString()),
    entry(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 20).toISOString())];
  assert.equal(groupHistory(sameDay)[0].entries[0].timestamp > groupHistory(sameDay)[0].entries[1].timestamp, true);

  // Grouping kosong -> tanpa section.
  assert.deepEqual(groupHistory([]), []);

  // Retensi 30 hari: entri lama harus dibuang saat save (pakai polyfill localStorage).
  const store: Record<string, string> = {};
  (globalThis as unknown as { localStorage?: unknown }).localStorage = {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => {
      store[k] = v;
    },
    removeItem: (k: string) => {
      delete store[k];
    },
    key: (_i: number) => null,
    length: 0,
  };
  saveHistoryEntry(entry(old));
  saveHistoryEntry(entry(today));
  const saved = JSON.parse(store[Object.keys(store)[0]]);
  assert.equal(saved.length, 1); // old (>30 hari) terbuang
  assert.equal(saved[0].timestamp, today);

  console.log('historyService self-check: OK');
}

main();
