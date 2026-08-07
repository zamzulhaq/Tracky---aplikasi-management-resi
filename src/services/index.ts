// Barrel + wiring default.
// Swap sumber data: ganti createMatchingService(...) dengan repository lain
// (mis. new WooCommerceRepository(new WooCommerceClient(wooCommerceConfig)))
// — Matching Engine tidak berubah.
export * from './config';
export * from './orderRepository';
export * from './matchingService';
export * from './wooCommerceClient';
export * from './wooCommerceRepository';
export * from './verificationTypes';
export * from './verificationService';
export * from './syncTypes';
export * from './syncService';
export * from './historyService';
import { createMatchingService } from './matchingService';
import { createSyncService } from './syncService';
import { WooCommerceClient } from './wooCommerceClient';
import { WooCommerceRepository } from './wooCommerceRepository';
import { wooCommerceConfig } from './config';
import { saveHistoryEntry } from './historyService';

const wooClient = new WooCommerceClient(wooCommerceConfig);

// Satu repository stateful untuk Matching & Sync: pullOrders() mengambil order
// Processing dari WooCommerce, getAllOrders() membaca cache hasil pull.
export const orderRepository = new WooCommerceRepository(wooClient);

export const matchingService = createMatchingService(orderRepository);

// History = localStorage (Firebase dihapus). syncService memanggil saveHistoryEntry
// HANYA setelah PUT WooCommerce sukses.
export const syncService = createSyncService({
  updateOrder: (orderId, status, meta) =>
    meta
      ? wooClient.updateOrder(orderId, { status, meta_data: meta })
      : wooClient.updateOrderStatus(orderId, status),
  saveHistory: async (entry) => {
    saveHistoryEntry(entry);
  },
  targetStatus: wooCommerceConfig.completeStatus,
});
