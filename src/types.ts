export interface Shipment {
  id: string;
  trackingNumber: string;
  sender: string;
  recipient: string;
  destination: string;
  status: 'Sudah Lunas' | 'Sudah Dikirim' | 'Completed';
  type: 'Parcel' | 'Box' | 'Container' | 'Document';
  weight: string;
  scannedAt?: string;
  eta: string;
  itemsCount: number;
}

export type TabType = 'home' | 'shipments' | 'profile' | 'orderScan' | 'resiScan';

export interface Order {
  orderId: string;
  orderNumber: string;
  trackingNumber: string;
  customerName: string;
  destination: string;
  status: string;
}

export interface MatchResult {
  found: boolean;
  order: Order | null;
  source: 'MATCHING_ENGINE';
}
