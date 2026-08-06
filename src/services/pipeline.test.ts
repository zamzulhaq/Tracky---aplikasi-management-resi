import assert from 'node:assert';
import { createScanPipeline, scanPipeline } from './pipeline';

async function main() {
  // Pipeline dengan engine tiruan: urutan Matching -> Verification -> Sync.
  const fakeOrder = {
    orderId: 'WC-10293',
    orderNumber: '10293',
    trackingNumber: 'LOGI-8842-X91',
    customerName: 'Budi Santoso',
    destination: 'Bandung, Jawa Barat',
    status: 'processing',
  };
  let matchCalled = false;
  let syncCalled = false;
  const fake = createScanPipeline(
    {
      matchOrder: async () => {
        matchCalled = true;
        return { found: true, order: fakeOrder, source: 'MATCHING_ENGINE' };
      },
    },
    {
      sync: async (verification) => {
        syncCalled = true;
        return {
          success: true,
          wooUpdated: true,
          historySaved: true,
          reason: 'SYNCED',
          verification,
          timestamp: new Date().toISOString(),
        };
      },
    }
  );

  const r = await fake.run('LOGI-8842-X91');
  assert.equal(matchCalled, true);
  assert.equal(syncCalled, true);
  assert.equal(r.success, true);
  assert.equal(r.verification.verified, true);
  assert.equal(r.verification.order?.customerName, 'Budi Santoso');

  // Glue asli (dummy repo + placeholder history) tanpa network:
  // resi tak dikenal -> langsung NOT_VERIFIED, tanpa panggilan keluar.
  const r2 = await scanPipeline.run('RESI-TIDAK-ADA');
  assert.equal(r2.success, false);
  assert.equal(r2.reason, 'NOT_VERIFIED');
  assert.equal(r2.verification.verified, false);

  console.log('pipeline self-check: OK');
}

main();
