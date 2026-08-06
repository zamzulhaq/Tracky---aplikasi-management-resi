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
  const deps: SyncDependencies = {
    updateOrderStatus: async (orderId, status) => {
      updateCalls++;
      assert.equal(orderId, 'WC-10293');
      assert.equal(status, 'completed');
    },
    saveHistory: async () => {
      saveCalls++;
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

  // Jalur 2: terverifikasi -> update + save history -> SYNCED.
  const r2 = await sync.sync(verification);
  assert.equal(r2.success, true);
  assert.equal(r2.reason, 'SYNCED');
  assert.equal(r2.wooUpdated, true);
  assert.equal(r2.historySaved, true);
  assert.equal(updateCalls, 1);
  assert.equal(saveCalls, 1);
  assert.equal(r2.verification.verified, true);
  assert.ok(!Number.isNaN(Date.parse(r2.timestamp)));

  // Jalur 3: update gagal -> history tidak dipanggil.
  const r3 = await createSyncService({
    updateOrderStatus: async () => {
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
    updateOrderStatus: async () => {},
    saveHistory: async () => {
      throw new Error('firestore down');
    },
  }).sync(verification);
  assert.equal(r4.success, false);
  assert.equal(r4.reason, 'HISTORY_SAVE_FAILED');
  assert.equal(r4.wooUpdated, true);
  assert.equal(r4.historySaved, false);

  // Jalur 5: targetStatus custom dari config (mis. 'lunas') dipakai saat update.
  let lastStatus = '';
  await createSyncService({
    updateOrderStatus: async (_id, status) => {
      lastStatus = status;
    },
    saveHistory: async () => {},
    targetStatus: 'lunas',
  }).sync(verification);
  assert.equal(lastStatus, 'lunas');

  // Jalur 6: targetStatus kosong -> fallback default 'completed'.
  lastStatus = '';
  await createSyncService({
    updateOrderStatus: async (_id, status) => {
      lastStatus = status;
    },
    saveHistory: async () => {},
    targetStatus: '',
  }).sync(verification);
  assert.equal(lastStatus, 'completed');

  console.log('syncService self-check: OK');
}

main();
