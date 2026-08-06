import { VerificationResult } from './verificationTypes';

export type SyncReason = 'NOT_VERIFIED' | 'SYNCED' | 'UPDATE_FAILED' | 'HISTORY_SAVE_FAILED';

export interface SyncResult {
  success: boolean;
  wooUpdated: boolean;
  historySaved: boolean;
  reason: SyncReason;
  verification: VerificationResult;
  timestamp: string;
}
