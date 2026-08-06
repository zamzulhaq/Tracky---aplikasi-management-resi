import assert from 'node:assert';
import { createMatchingService, normalizeOrderNumber } from './matchingService';

const fakeRepo = {
  async getAllOrders() {
    return [
      {
        orderId: '68408',
        orderNumber: '68408',
        trackingNumber: '68408',
        customerName: 'Syahdini Handiani',
        destination: 'Bekasi, Jawa Barat',
        status: 'sudah-lunas',
      },
    ];
  },
};

async function main() {
  assert.equal(normalizeOrderNumber('PO # 68408'), '68408');
  assert.equal(normalizeOrderNumber('PO#68408'), '68408');
  assert.equal(normalizeOrderNumber('#68408'), '68408');
  assert.equal(normalizeOrderNumber(' 68408 '), '68408');
  assert.equal(normalizeOrderNumber('abc'), '');

  const service = createMatchingService(fakeRepo);

  const plain = await service.matchOrder('68408');
  assert.equal(plain.found, true);
  assert.equal(plain.source, 'MATCHING_ENGINE');
  assert.equal(plain.order?.customerName, 'Syahdini Handiani');

  const poPrefixed = await service.matchOrder('PO#68408');
  assert.equal(poPrefixed.found, true);

  const hashPrefixed = await service.matchOrder('# 68408');
  assert.equal(hashPrefixed.found, true);

  const miss = await service.matchOrder('12345');
  assert.equal(miss.found, false);
  assert.equal(miss.order, null);
  assert.equal(miss.source, 'MATCHING_ENGINE');

  const empty = await service.matchOrder('');
  assert.equal(empty.found, false);

  console.log('matchingService self-check: OK');
}

main();
