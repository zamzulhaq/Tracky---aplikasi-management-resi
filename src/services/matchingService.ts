import { MatchResult } from '../types';
import { OrderRepository } from './orderRepository';

// Normalisasi nomor order dari barcode label: buang semua kecuali digit.
// Nomor order toko selalu numerik ("68408"), jadi varian barcode
// "PO#68408", "#68408", "PO # 68408" semuanya -> "68408".
export function normalizeOrderNumber(input: string): string {
  return input.replace(/[^0-9]/g, '');
}

// Matching Engine. Terima kode hasil scan label (nomor order),
// normalisasi ke digit, cocokkan ke repository, return object konsisten —
// tidak pernah me-return data mentah.
export function createMatchingService(repo: OrderRepository) {
  return {
    async matchOrder(labelCode: string): Promise<MatchResult> {
      const normalized = normalizeOrderNumber(labelCode);
      if (!normalized) return { found: false, order: null, source: 'MATCHING_ENGINE' };
      const orders = await repo.getAllOrders();
      const order =
        orders.find(
          (o) =>
            normalizeOrderNumber(o.orderNumber) === normalized ||
            normalizeOrderNumber(o.orderId) === normalized
        ) ?? null;
      return { found: order !== null, order, source: 'MATCHING_ENGINE' };
    },
  };
}
