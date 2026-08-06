import assert from 'node:assert';
import { mapOrderStatus, mapOrderToShipment } from './orderMapping';

function main() {
  const s = mapOrderToShipment({
    orderId: '10293',
    orderNumber: '10293',
    trackingNumber: 'JP123456789',
    customerName: 'Budi Santoso',
    destination: 'Bandung, Jawa Barat',
    status: 'sudah-lunas',
  });
  assert.equal(s.id, '10293');
  assert.equal(s.trackingNumber, 'JP123456789');
  assert.equal(s.recipient, 'Budi Santoso');
  assert.equal(s.destination, 'Bandung, Jawa Barat');
  assert.equal(s.status, 'Sudah Lunas');
  assert.equal(s.type, 'Parcel');
  assert.ok(s.scannedAt === undefined);
  assert.equal(mapOrderStatus('sudah-lunas'), 'Sudah Lunas');
  assert.equal(mapOrderStatus('sudah-dikirim'), 'Sudah Dikirim');
  assert.equal(mapOrderStatus('completed'), 'Completed');
  assert.equal(mapOrderStatus('unknown-status'), 'Sudah Lunas');

  console.log('orderMapping self-check: OK');
}

main();
