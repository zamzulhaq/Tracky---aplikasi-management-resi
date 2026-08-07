import { MatchResult } from '../types';
import { VerificationResult } from './verificationTypes';
import { SyncOptions, SyncResult } from './syncTypes';
import { matchingService, syncService } from './index';
import { verifyMatch } from './verificationService';

interface MatchEngine {
  matchOrder(trackingNumber: string): Promise<MatchResult>;
}
interface SyncEngine {
  sync(verification: VerificationResult, opts?: SyncOptions): Promise<SyncResult>;
}

// Application Flow: Scanner -> Matching -> Verification -> Sync -> SyncResult.
// Satu-satunya pintu masuk untuk UI. UI tidak tahu WooCommerce/Repository/
// Verification/Matching — hanya menerima VerificationResult (untuk dialog
// konfirmasi) dan SyncResult.
export function createScanPipeline(matching: MatchEngine, sync: SyncEngine) {
  async function match(trackingNumber: string): Promise<VerificationResult> {
    const m = await matching.matchOrder(trackingNumber);
    return verifyMatch(m, trackingNumber);
  }
  async function commit(verification: VerificationResult, opts?: SyncOptions): Promise<SyncResult> {
    return sync.sync(verification, opts);
  }
  // Backward-compat: match + commit sekali jalan (perilaku lama).
  async function run(trackingNumber: string): Promise<SyncResult> {
    return commit(await match(trackingNumber));
  }
  return { match, commit, run };
}

export const scanPipeline = createScanPipeline(matchingService, syncService);
