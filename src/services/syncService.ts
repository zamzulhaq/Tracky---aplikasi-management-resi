import { VerificationResult } from './verificationTypes';
import { SyncResult } from './syncTypes';

export interface HistoryEntry {
  orderId: string;
  trackingNumber: string;
  verified: boolean;
  timestamp: string;
}

// Dependensi di-inject agar nanti Firebase Logger / WooCommerce dapat diganti
// tanpa menyentuh Sync Engine.
export interface SyncDependencies {
  updateOrderStatus: (orderId: string, status: string) => Promise<void>;
  saveHistory: (entry: HistoryEntry) => Promise<void>;
  // Status tujuan saat order terverifikasi (default 'completed' bila kosong).
  targetStatus?: string;
}

// Sync Engine: SATU-SATUNYA tempat orkestrasi sinkronisasi.
// UI -> Sync Engine -> (WooCommerce, history). Verification/Scanner tidak tahu backend.
export function createSyncService(deps: SyncDependencies) {
  const targetStatus = deps.targetStatus || 'completed';

  return {
    async sync(verification: VerificationResult): Promise<SyncResult> {
      const timestamp = new Date().toISOString();
      const base = { verification, timestamp };

      if (!verification.verified || !verification.order) {
        // Tidak boleh memanggil repository apa pun.
        return { ...base, success: false, wooUpdated: false, historySaved: false, reason: 'NOT_VERIFIED' };
      }

      const order = verification.order;
      try {
        await deps.updateOrderStatus(order.orderId, targetStatus);
      } catch {
        return { ...base, success: false, wooUpdated: false, historySaved: false, reason: 'UPDATE_FAILED' };
      }

      try {
        await deps.saveHistory({
          orderId: order.orderId,
          trackingNumber: order.trackingNumber,
          verified: true,
          timestamp,
        });
      } catch {
        return { ...base, success: false, wooUpdated: true, historySaved: false, reason: 'HISTORY_SAVE_FAILED' };
      }

      return { ...base, success: true, wooUpdated: true, historySaved: true, reason: 'SYNCED' };
    },
  };
}
