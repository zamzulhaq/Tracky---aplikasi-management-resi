import { VerificationResult } from './verificationTypes';
import { HistoryEntry, ScanMode, SyncOptions, SyncResult } from './syncTypes';

export interface SyncDependencies {
  // PUT ke WooCommerce: status (mode ORDER), status + meta resi (mode RESI).
  updateOrder: (
    orderId: string,
    status: string,
    meta?: Array<{ key: string; value: unknown }>
  ) => Promise<void>;
  saveHistory: (entry: HistoryEntry) => Promise<void>;
  // Status tujuan mode ORDER (default 'completed' bila kosong).
  targetStatus?: string;
}

// Sync Engine: SATU-SATUNYA tempat orkestrasi sinkronisasi.
// UI -> Sync Engine -> (WooCommerce, history). Verification/Scanner tidak tahu backend.
export function createSyncService(deps: SyncDependencies) {
  const orderTarget = deps.targetStatus || 'completed';
  const resiStatus = 'completed';
  const resiMetaKey = '_custom_no_resi';

  return {
    async sync(verification: VerificationResult, opts: SyncOptions = {}): Promise<SyncResult> {
      const timestamp = new Date().toISOString();
      const base = { verification, timestamp };

      if (!verification.verified || !verification.order) {
        // Tidak boleh memanggil repository apa pun.
        return { ...base, success: false, wooUpdated: false, historySaved: false, reason: 'NOT_VERIFIED' };
      }

      const order = verification.order;
      const mode: ScanMode = opts.mode === 'RESI' ? 'RESI' : 'ORDER';
      const isResi = mode === 'RESI';
      const statusAfter = isResi ? resiStatus : orderTarget;
      const meta = isResi ? [{ key: resiMetaKey, value: opts.resi ?? '' }] : undefined;

      try {
        await deps.updateOrder(order.orderId, statusAfter, meta);
      } catch {
        return { ...base, success: false, wooUpdated: false, historySaved: false, reason: 'UPDATE_FAILED' };
      }

      try {
        await deps.saveHistory({
          mode,
          orderId: order.orderId,
          customerName: order.customerName,
          trackingNumber: opts.resi ?? order.trackingNumber,
          statusBefore: order.status,
          statusAfter,
          timestamp,
          success: true,
        });
      } catch {
        return { ...base, success: false, wooUpdated: true, historySaved: false, reason: 'HISTORY_SAVE_FAILED' };
      }

      return { ...base, success: true, wooUpdated: true, historySaved: true, reason: 'SYNCED' };
    },
  };
}
