import { VerificationResult } from './verificationTypes';

export type SyncReason = 'NOT_VERIFIED' | 'SYNCED' | 'UPDATE_FAILED' | 'HISTORY_SAVE_FAILED';

export type ScanMode = 'ORDER' | 'RESI';

export interface SyncOptions {
  mode?: ScanMode;
  // Nomor resi hasil scan (mode RESI). Disimpan APA ADANYA, tanpa normalisasi.
  resi?: string;
}

// Entri Local History (localStorage key: tracky_scan_history).
export interface HistoryEntry {
  mode: ScanMode;
  orderId: string;
  customerName: string;
  // Nomor resi hasil scan (mode RESI) / fallback tracking number (mode ORDER).
  trackingNumber: string;
  statusBefore: string;
  statusAfter: string;
  timestamp: string;
  success: boolean;
}

export interface SyncResult {
  success: boolean;
  wooUpdated: boolean;
  historySaved: boolean;
  reason: SyncReason;
  verification: VerificationResult;
  timestamp: string;
}
