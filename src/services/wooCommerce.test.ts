import assert from 'node:assert';
import { WooCommerceClient, WooOrderResponse } from './wooCommerceClient';
import { WooCommerceRepository } from './wooCommerceRepository';
import { createMatchingService } from './matchingService';
import { WooCommerceConfig } from './config';

const config: WooCommerceConfig = {
  baseUrl: 'https://store.test/wp-json/wc/v3',
  consumerKey: 'ck_test',
  consumerSecret: 'cs_test',
};

async function main() {
  // --- Client: URL & auth header benar, tanpa logic bisnis ---
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    return new Response(JSON.stringify([{ id: 1 }]), { status: 200 });
  };

  const client = new WooCommerceClient(config);
  const raw = await client.getOrders();
  assert.equal(
    calls[0].url,
    'https://store.test/wp-json/wc/v3/orders?status=processing&per_page=100'
  );
  const headers = calls[0].init.headers as Record<string, string>;
  assert.ok(headers.Authorization?.startsWith('Basic '));
  assert.equal((raw as WooOrderResponse[]).length, 1);

  // --- Status fetch custom dari config (bukan hardcode) ---
  const custom = new WooCommerceClient({ ...config, fetchStatus: 'keep-invoice' });
  await custom.getOrders();
  assert.equal(
    calls[1].url,
    'https://store.test/wp-json/wc/v3/orders?status=keep-invoice&per_page=100'
  );

  // --- Banyak status: satu request per status, hasil digabung ---
  await client.getOrders(['sudah-lunas', 'sudah-dikirim', 'completed']);
  assert.equal(calls[2].url, 'https://store.test/wp-json/wc/v3/orders?status=sudah-lunas&per_page=100');
  assert.equal(calls[3].url, 'https://store.test/wp-json/wc/v3/orders?status=sudah-dikirim&per_page=100');
  assert.equal(calls[4].url, 'https://store.test/wp-json/wc/v3/orders?status=completed&per_page=100');

  await client.updateOrderStatus(10293, 'completed');
  assert.equal(calls[5].url, 'https://store.test/wp-json/wc/v3/orders/10293');
  assert.equal(calls[5].init.method, 'PUT');
  assert.equal(JSON.parse(String(calls[5].init.body)).status, 'completed');
  globalThis.fetch = originalFetch;

  // --- Timeout: request yang menggantung dibatalkan ---
  globalThis.fetch = (_url, init) =>
    new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () =>
        reject(new DOMException('The operation was aborted.', 'AbortError'))
      );
    });
  const slow = new WooCommerceClient({ ...config, timeoutMs: 50 });
  await assert.rejects(slow.getOrders(), /timed out/);
  globalThis.fetch = originalFetch;

  // --- Repository: mapping rapi, tidak ada response mentah ---
  const lunas: WooOrderResponse = {
    id: 10293,
    number: '10293',
    status: 'sudah-lunas',
    billing: { first_name: 'Budi', last_name: 'Santoso' },
    shipping: { city: 'Bandung', state: 'Jawa Barat' },
    meta_data: [{ key: '_custom_no_resi', value: 'JP123456789' }],
  };
  const dikirim: WooOrderResponse = {
    id: 10294,
    number: '10294',
    status: 'sudah-dikirim',
    billing: { first_name: 'Siti', last_name: '' },
    shipping: { city: 'Jakarta', state: 'DKI Jakarta' },
  };
  const selesai: WooOrderResponse = {
    id: 10295,
    number: '10295',
    status: 'completed',
    billing: { first_name: 'Ahmad', last_name: 'Fauzi' },
    shipping: { city: 'Surabaya', state: 'Jawa Timur' },
  };
  const repo = new WooCommerceRepository({
    getOrders: async (statuses?: string[]) =>
      statuses ? [lunas, dikirim, selesai].filter((o) => statuses.includes(o.status)) : [lunas],
    updateOrderStatus: async () => {},
  } as unknown as WooCommerceClient);
  const pulled = await repo.pullOrders(['sudah-lunas', 'sudah-dikirim', 'completed'], 'sudah-lunas');
  assert.equal(pulled.pendingCount, 1);
  assert.equal(pulled.orders.length, 3);
  assert.deepEqual(pulled.orders[0], {
    orderId: '10293',
    orderNumber: '10293',
    trackingNumber: 'JP123456789',
    customerName: 'Budi Santoso',
    destination: 'Bandung, Jawa Barat',
    status: 'sudah-lunas',
  });

  // Cache = HANYA pool scan (sudah-lunas); order sudah-dikirim/completed
  // TIDAK boleh terlihat scanner (tidak boleh di-match lalu diturunkan statusnya).
  const orders = await repo.getAllOrders();
  assert.equal(orders.length, 1);
  assert.equal(orders[0].orderId, '10293');

  // --- DI: Matching Engine langsung jalan tanpa perubahan ---
  const matching = createMatchingService(repo);
  const hit = await matching.matchOrder('PO#10293');
  assert.equal(hit.found, true);
  assert.equal(hit.order?.customerName, 'Budi Santoso');
  // Nomor order yang sudah completed tidak boleh cocok (tidak di cache).
  const miss = await matching.matchOrder('10295');
  assert.equal(miss.found, false);

  // --- Error ternormalisasi, bukan response mentah ---
  const bad = new WooCommerceRepository({
    getOrders: async () => {
      throw { raw: 'boom' };
    },
  } as unknown as WooCommerceClient);
  await assert.rejects(bad.pullOrders(['sudah-lunas'], 'sudah-lunas'), /Failed to fetch WooCommerce orders/);

  console.log('wooCommerce self-check: OK');
}

main();
