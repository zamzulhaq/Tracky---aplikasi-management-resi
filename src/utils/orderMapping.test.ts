import assert from 'node:assert';
import { mapOrderStatus, mapOrderToShipment, shipmentToOrder } from './orderMapping';

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

  // Reverse-map: Shipment -> Order untuk mode RESI Scan.
  const o = shipmentToOrder({ ...s, status: 'Sudah Dikirim' });
  assert.equal(o.orderId, '10293');
  assert.equal(o.customerName, 'Budi Santoso');
  assert.equal(o.status, 'sudah-dikirim');
  assert.equal(shipmentToOrder({ ...s, status: 'Completed' }).status, 'completed');

  console.log('orderMapping self-check: OK');
}

main();
