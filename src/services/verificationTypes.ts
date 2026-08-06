import { Order } from '../types';

export type VerificationReason = 'VERIFIED' | 'ORDER_NOT_FOUND';

export interface VerificationResult {
  verified: boolean;
  reason: VerificationReason;
  order: Order | null;
  trackingNumber: string;
  timestamp: string;
  status: string;
}
