import { MatchResult } from '../types';
import { VerificationResult } from './verificationTypes';

// Verification Engine: seluruh business rule kelayakan order ada di layer ini.
// Terima MatchResult dari Matching Engine, return VerificationResult konsisten.
// Belum ada request HTTP / Firestore — murni transformasi.
export function verifyMatch(match: MatchResult, trackingNumber: string): VerificationResult {
  const order = match.found ? match.order : null;
  return {
    verified: match.found,
    reason: match.found ? 'VERIFIED' : 'ORDER_NOT_FOUND',
    order,
    trackingNumber,
    timestamp: new Date().toISOString(),
    status: order?.status ?? '',
  };
}
