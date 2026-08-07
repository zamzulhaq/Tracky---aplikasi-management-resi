import assert from 'node:assert';
import { createMatchingService } from './matchingService';
import { verifyMatch } from './verificationService';
import { createSyncService, SyncDependencies } from './syncService';

const fakeRepo = {
  async getAllOrders() {
    return [
      { orderId: 'WC-10293', orderNumber: '10293', trackingNumber: 'LOGI-8842-X91', customerName: 'Budi Santoso', destination: 'Bandung, Jawa Barat', status: 'processing' },
    ];
  },
};

async function main() {
  const matching = createMatchingService(fakeRepo);
  const verification = verifyMatch(
    await matching.matchOrder('10293'),
    '10293'
  );
  const notVerified = verifyMatch(await matching.matchOrder('NOPE'), 'NOPE');

  let updateCalls = 0;
  let saveCalls = 0;
  let lastHistory: Record<string, unknown> = {};
  const deps: SyncDependencies = {
    updateOrder: async (orderId, status, meta) => {
      updateCalls++;
      assert.equal(orderId, 'WC-10293');
      assert.equal(status, 'completed');
      assert.equal(meta, undefined);
    },
    saveHistory: async (entry) => {
      saveCalls++;
      lastHistory = entry as unknown as Record<string, unknown>;
    },
  };
  const sync = createSyncService(deps);

  // Jalur 1: tidak terverifikasi -> tanpa panggilan repository.
  const r1 = await sync.sync(notVerified);
  assert.equal(r1.success, false);
  assert.equal(r1.reason, 'NOT_VERIFIED');
  assert.equal(r1.wooUpdated, false);
  assert.equal(r1.historySaved, false);
  assert.equal(updateCalls, 0);
  assert.equal(saveCalls, 0);

  // Jalur 2: terverifikasi (mode ORDER default) -> update status + history.
  const r2 = await sync.sync(verification);
  assert.equal(r2.success, true);
  assert.equal(r2.reason, 'SYNCED');
  assert.equal(r2.wooUpdated, true);
  assert.equal(r2.historySaved, true);
  assert.equal(updateCalls, 1);
  assert.equal(saveCalls, 1);
  assert.equal(r2.verification.verified, true);
  assert.ok(!Number.isNaN(Date.parse(r2.timestamp)));
  // History berisi field lengkap mode ORDER.
  assert.equal(lastHistory.mode, 'ORDER');
  assert.equal(lastHistory.customerName, 'Budi Santoso');
  assert.equal(lastHistory.statusBefore, 'processing');
  assert.equal(lastHistory.statusAfter, 'completed');
  assert.equal(lastHistory.trackingNumber, 'LOGI-8842-X91');
  assert.equal(lastHistory.success, true);

  // Jalur 3: update gagal -> history tidak dipanggil.
  const r3 = await createSyncService({
    updateOrder: async () => {
      throw new Error('connection refused');
    },
    saveHistory: async () => {
      saveCalls++;
    },
  }).sync(verification);
  assert.equal(r3.success, false);
  assert.equal(r3.reason, 'UPDATE_FAILED');
  assert.equal(r3.wooUpdated, false);
  assert.equal(r3.historySaved, false);
  assert.equal(saveCalls, 1); // belum bertambah dari jalur 2

  // Jalur 4: history gagal -> Woo sudah terupdate.
  const r4 = await createSyncService({
    updateOrder: async () => {},
    saveHistory: async () => {
      throw new Error('firestore down');
    },
  }).sync(verification);
  assert.equal(r4.success, false);
  assert.equal(r4.reason, 'HISTORY_SAVE_FAILED');
  assert.equal(r4.wooUpdated, true);
  assert.equal(r4.historySaved, false);

  // Jalur 5: targetStatus custom dari config dipakai mode ORDER.
  let lastStatus = '';
  await createSyncService({
    updateOrder: async (_id, status) => {
      lastStatus = status;
    },
    saveHistory: async () => {},
    targetStatus: 'sudah-dikirim',
  }).sync(verification);
  assert.equal(lastStatus, 'sudah-dikirim');

  // Jalur 6: mode RESI -> status completed + meta _custom_no_resi VERBATIM,
  // history mode RESI dengan trackingNumber = nilai scan apa adanya.
  let resiStatus = '';
  let resiMeta: Array<{ key: string; value: unknown }> | undefined;
  let resiHistory: Record<string, unknown> = {};
  const resiVerification = verifyMatch(
    await matching.matchOrder('10293'),
    '10293'
  );
  const resiResult = await createSyncService({
    updateOrder: async (_id, status, meta) => {
      resiStatus = status;
      resiMeta = meta;
    },
    saveHistory: async (entry) => {
      resiHistory = entry as unknown as Record<string, unknown>;
    },
    targetStatus: 'sudah-dikirim',
  }).sync(resiVerification, { mode: 'RESI', resi: 'Wahana Y9LFGX92' });
  assert.equal(resiResult.success, true);
  assert.equal(resiStatus, 'completed');
  assert.deepEqual(resiMeta, [{ key: '_custom_no_resi', value: 'Wahana Y9LFGX92' }]);
  assert.equal(resiHistory.mode, 'RESI');
  assert.equal(resiHistory.statusAfter, 'completed');
  assert.equal(resiHistory.trackingNumber, 'Wahana Y9LFGX92');

  // Jalur 7: targetStatus kosong -> fallback 'completed' (mode ORDER).
  lastStatus = '';
  await createSyncService({
    updateOrder: async (_id, status) => {
      lastStatus = status;
    },
    saveHistory: async () => {},
    targetStatus: '',
  }).sync(verification);
  assert.equal(lastStatus, 'completed');

  console.log('syncService self-check: OK');
}

main();
