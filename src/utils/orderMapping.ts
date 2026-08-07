import { Order, Shipment } from '../types';

// Status WooCommerce -> status tampilan (nilai union di types.ts).
// Status toko: sudah-lunas (ditarik, belum dikirim) -> sudah-dikirim (setelah
// scan sukses) -> completed (resi diisi di website, di luar app).
const STATUS_MAP: Record<string, Shipment['status']> = {
  'sudah-lunas': 'Sudah Lunas',
  'sudah-dikirim': 'Sudah Dikirim',
  completed: 'Completed',
};

const REVERSE_STATUS_MAP: Record<Shipment['status'], string> = {
  'Sudah Lunas': 'sudah-lunas',
  'Sudah Dikirim': 'sudah-dikirim',
  Completed: 'completed',
};

export function mapOrderStatus(status: string): Shipment['status'] {
  return STATUS_MAP[status] ?? 'Sudah Lunas';
}

// SATU-SATUNYA tempat mapping Order -> Shipment. Component tidak boleh
// menurunkan Order; HomeView / ShipmentsView / Scanner hanya menerima Shipment.
export function mapOrderToShipment(order: Order): Shipment {
  return {
    id: order.orderId,
    trackingNumber: order.trackingNumber,
    sender: 'WooCommerce',
    recipient: order.customerName,
    destination: order.destination,
    status: mapOrderStatus(order.status),
    type: 'Parcel',
    weight: '—',
    eta: '—',
    itemsCount: 0,
  };
}

// Reverse: Shipment (display) -> Order (input sync). Dipakai mode RESI Scan,
// karena context menyimpan collection Shipment dan syncService butuh Order.
// orderNumber == orderId di toko ini (number API selalu sama dengan id).
export function shipmentToOrder(shipment: Shipment): Order {
  return {
    orderId: shipment.id,
    orderNumber: shipment.id,
    trackingNumber: shipment.trackingNumber,
    customerName: shipment.recipient,
    destination: shipment.destination,
    status: REVERSE_STATUS_MAP[shipment.status] ?? shipment.status,
  };
}
