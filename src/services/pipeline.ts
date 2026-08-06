import { MatchResult } from '../types';
import { VerificationResult } from './verificationTypes';
import { SyncResult } from './syncTypes';
import { matchingService, syncService } from './index';
import { verifyMatch } from './verificationService';

interface MatchEngine {
  matchOrder(trackingNumber: string): Promise<MatchResult>;
}
interface SyncEngine {
  sync(verification: VerificationResult): Promise<SyncResult>;
}

// Application Flow: Scanner -> Matching -> Verification -> Sync -> SyncResult.
// Satu-satunya pintu masuk untuk UI. UI tidak tahu WooCommerce/Repository/
// Verification/Matching — hanya menerima SyncResult.
export function createScanPipeline(matching: MatchEngine, sync: SyncEngine) {
  return {
    async run(trackingNumber: string): Promise<SyncResult> {
      const match = await matching.matchOrder(trackingNumber);
      const verification = verifyMatch(match, trackingNumber);
      return sync.sync(verification);
    },
  };
}

export const scanPipeline = createScanPipeline(matchingService, syncService);
