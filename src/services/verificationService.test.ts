import assert from 'node:assert';
import { createMatchingService } from './matchingService';
import { verifyMatch } from './verificationService';

const fakeRepo = {
  async getAllOrders() {
    return [
      { orderId: 'WC-10293', orderNumber: '10293', trackingNumber: 'LOGI-8842-X91', customerName: 'Budi Santoso', destination: 'Bandung, Jawa Barat', status: 'processing' },
    ];
  },
};

async function main() {
  const matching = createMatchingService(fakeRepo);

  const hit = await matching.matchOrder('PO#10293');
  const vHit = verifyMatch(hit, 'PO#10293');
  assert.equal(vHit.verified, true);
  assert.equal(vHit.reason, 'VERIFIED');
  assert.equal(vHit.order?.customerName, 'Budi Santoso');
  assert.equal(vHit.trackingNumber, 'PO#10293');
  assert.equal(vHit.status, 'processing');
  assert.ok(!Number.isNaN(Date.parse(vHit.timestamp)));

  const miss = await matching.matchOrder('RESI-APA');
  const vMiss = verifyMatch(miss, 'RESI-APA');
  assert.equal(vMiss.verified, false);
  assert.equal(vMiss.reason, 'ORDER_NOT_FOUND');
  assert.equal(vMiss.order, null);
  assert.equal(vMiss.status, '');
  assert.equal(vMiss.trackingNumber, 'RESI-APA');

  console.log('verificationService self-check: OK');
}

main();
