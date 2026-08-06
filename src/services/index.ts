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
import { createMatchingService } from './matchingService';
import { createSyncService, type SyncDependencies } from './syncService';
import { WooCommerceClient } from './wooCommerceClient';
import { WooCommerceRepository } from './wooCommerceRepository';
import { wooCommerceConfig } from './config';

const wooClient = new WooCommerceClient(wooCommerceConfig);

// Satu repository stateful untuk Matching & Sync: pullOrders() mengambil order
// Processing dari WooCommerce, getAllOrders() membaca cache hasil pull.
export const orderRepository = new WooCommerceRepository(wooClient);

export const matchingService = createMatchingService(orderRepository);

// History masih placeholder: ganti saveHistory dengan Firebase Logger saat
// integrasi Firestore — Sync Engine tidak berubah.
const placeholderSaveHistory: SyncDependencies['saveHistory'] = async () => {};

export const syncService = createSyncService({
  updateOrderStatus: (orderId, status) => wooClient.updateOrderStatus(orderId, status),
  saveHistory: placeholderSaveHistory,
  targetStatus: wooCommerceConfig.completeStatus,
});
