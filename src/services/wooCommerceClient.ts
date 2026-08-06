import { WooCommerceConfig } from './config';

// Respon mentah WooCommerce — tipe batas di client. Mapping ke model Order
// dilakukan repository, client tidak pernah keluar dari sini.
export interface WooOrderResponse {
  id: number;
  number: string;
  status: string;
  billing?: { first_name?: string; last_name?: string };
  shipping?: { city?: string; state?: string };
  meta_data?: Array<{ key: string; value: unknown }>;
}

// Client murni HTTP. Tidak ada business logic.
export class WooCommerceClient {
  constructor(private readonly config: WooCommerceConfig) {}

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs ?? 15000);
    let res: Response;
    try {
      res = await fetch(`${this.config.baseUrl}${path}`, {
        ...init,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(`${this.config.consumerKey}:${this.config.consumerSecret}`)}`,
          ...init.headers,
        },
      });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error('WooCommerce request timed out');
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
    if (!res.ok) {
      throw new Error(`WooCommerce HTTP ${res.status} ${res.statusText}`);
    }
    return res.json() as Promise<T>;
  }

  // Tarik order beberapa status (dari config.fetchStatuses / env). Satu request
  // per status (per_page=100 = halaman terbaru), hasil digabung. Default bila
  // tidak ada argumen: status fetchStatus dari config (perilaku lama).
  async getOrders(statuses: string[] = []): Promise<WooOrderResponse[]> {
    const list = statuses.length ? statuses : [this.config.fetchStatus || 'processing'];
    const pages = await Promise.all(
      list.map((status) =>
        this.request<WooOrderResponse[]>(`/orders?status=${encodeURIComponent(status)}&per_page=100`)
      )
    );
    return pages.filter(Array.isArray).flat();
  }

  async updateOrderStatus(orderId: string | number, status: string): Promise<void> {
    await this.request(`/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }
}
// ponytail: satu halaman (per_page=100), pagination ditambah bila order > 100.
