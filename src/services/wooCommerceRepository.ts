import { Order } from '../types';
import { OrderRepository } from './orderRepository';
import { WooCommerceClient, WooOrderResponse } from './wooCommerceClient';

// Kunci meta WooCommerce yang berisi nomor resi. Kunci asli toko:
// '_custom_no_resi'. Tambah kunci lain bila plugin store berbeda.
const TRACKING_META_KEYS = ['_custom_no_resi', '_nomor_resi', '_tracking_number', 'tracking_number', '_awb', 'awb'];

function extractTrackingNumber(order: WooOrderResponse): string {
  const meta = order.meta_data?.find((m) => TRACKING_META_KEYS.includes(m.key));
  if (meta && typeof meta.value === 'string' && meta.value.trim()) return meta.value.trim();
  // ponytail: nomor resi tak selalu tersimpan di meta (sudah-lunas kosong);
  // fallback ke nomor order.
  return String(order.number || order.id);
}

// Semua mapping dilakukan di sini — response API mentah tidak pernah keluar repository.
export function mapWooOrderToOrder(order: WooOrderResponse): Order {
  return {
    // orderId = id API, dipakai untuk PUT status (aman walau ada prefix nomor).
    orderId: String(order.id),
    // orderNumber = nomor order di label ("PO # 68408" -> 68408), dipakai untuk matching.
    orderNumber: String(order.number || order.id),
    trackingNumber: extractTrackingNumber(order),
    customerName: [order.billing?.first_name, order.billing?.last_name].filter(Boolean).join(' '),
    destination: [order.shipping?.city, order.shipping?.state].filter(Boolean).join(', '),
    status: order.status,
  };
}

export interface PullOrdersResult {
  orders: Order[];
  // Jumlah order yang masih menunggu dikirim (poolStatus) — basis progress bar.
  pendingCount: number;
}

export class WooCommerceRepository implements OrderRepository {
  private cache: Order[] = [];

  constructor(private readonly client: WooCommerceClient) {}

  // Satu-satunya tempat menarik data dari WooCommerce: ambil order beberapa
  // status (tab Shipments) lewat client, simpan HANYA poolStatus ke cache.
  // Cache = pool scan; order sudah-dikirim/completed TIDAK boleh di-match
  // scanner (bisa menurunkan status yang sudah maju).
  async pullOrders(statuses: string[], poolStatus: string): Promise<PullOrdersResult> {
    let raw: WooOrderResponse[];
    try {
      raw = await this.client.getOrders(statuses);
    } catch (err) {
      // Selalu lempar Error ternormalisasi, bukan response mentah.
      throw new Error(
        `Failed to fetch WooCommerce orders: ${err instanceof Error ? err.message : String(err)}`
      );
    }
    const orders = raw.map(mapWooOrderToOrder);
    this.cache = orders.filter((o) => o.status === poolStatus);
    return { orders, pendingCount: this.cache.length };
  }

  // Matching Engine hanya membaca cache hasil pull — tidak ada request keluar.
  getAllOrders(): Promise<Order[]> {
    return Promise.resolve(this.cache);
  }
}
