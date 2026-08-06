import { Order, Shipment } from '../types';

// Status WooCommerce -> status tampilan (nilai union di types.ts).
// Status toko: sudah-lunas (ditarik, belum dikirim) -> sudah-dikirim (setelah
// scan sukses) -> completed (resi diisi di website, di luar app).
const STATUS_MAP: Record<string, Shipment['status']> = {
  'sudah-lunas': 'Sudah Lunas',
  'sudah-dikirim': 'Sudah Dikirim',
  completed: 'Completed',
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
