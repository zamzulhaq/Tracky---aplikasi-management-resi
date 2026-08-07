import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Shipment } from '../types';
import { orderRepository, wooCommerceConfig } from '../services';
import { ScanMode, SyncResult } from '../services/syncTypes';
import { mapOrderToShipment } from '../utils/orderMapping';
import { computeIsCompleted, computeProgressPercent } from '../utils/progress';

function friendlyError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes('timed out')) return 'Koneksi ke WooCommerce timeout. Coba lagi.';
  if (msg.includes('401') || msg.includes('403'))
    return 'Autentikasi WooCommerce gagal. Periksa consumer key/secret.';
  return msg;
}

interface OrderContextValue {
  shipments: Shipment[];
  loading: boolean;
  error: string | null;
  totalCount: number | null;
  verifiedCount: number;
  todayScans: number;
  progressPercent: number;
  isCompleted: boolean;
  pullOrders: () => Promise<void>;
  reportSyncResult: (result: SyncResult, opts?: { mode?: ScanMode; resi?: string }) => void;
}

const OrderContext = createContext<OrderContextValue | null>(null);

// Counter progress = SINGLE SOURCE OF TRUTH (PRD Req-1.3).
// UI/Scanner/Pipeline TIDAK menghitung — mereka hanya melapor ke sini.
export function OrderProvider({ children }: { children: ReactNode }) {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [verifiedCount, setVerifiedCount] = useState(0);
  // "Today's Scans": akumulasi scan sukses per sesi app (tidak reset saat pull).
  // ponytail: reset saat app dimuat ulang; lintas-hari butuh Firebase history.
  const [todayScans, setTodayScans] = useState(0);

  const pullOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await orderRepository.pullOrders(
        wooCommerceConfig.fetchStatuses ?? [wooCommerceConfig.fetchStatus ?? 'processing'],
        wooCommerceConfig.fetchStatus ?? 'processing'
      );
      setTotalCount(result.pendingCount);
      setVerifiedCount(0);
      setShipments(result.orders.map(mapOrderToShipment));
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // Counter naik HANYA jika SyncResult.success. Gagal -> tidak berubah.
  // Saat sukses, shipment terkait ikut berubah di collection yang sama:
  // mode ORDER -> 'Sudah Dikirim'; mode RESI -> 'Completed' + trackingNumber
  // = nomor resi hasil scan (verbatim). Duplicate protection dibaca UI dari
  // status collection ini.
  const reportSyncResult = useCallback(
    (result: SyncResult, opts?: { mode?: ScanMode; resi?: string }) => {
      if (!result.success) return;
      setVerifiedCount((v) => v + 1);
      setTodayScans((v) => v + 1);
      const orderId = result.verification.order?.orderId;
      const isResi = opts?.mode === 'RESI';
      if (orderId) {
        setShipments((prev) =>
          prev.map((s) =>
            s.id === orderId
              ? {
                  ...s,
                  status: isResi ? 'Completed' : 'Sudah Dikirim',
                  trackingNumber: isResi && opts?.resi ? opts.resi : s.trackingNumber,
                  scannedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
                }
              : s
          )
        );
      }
    },
    []
  );

  const progressPercent = useMemo(
    () => computeProgressPercent(verifiedCount, totalCount),
    [verifiedCount, totalCount]
  );
  const isCompleted = useMemo(
    () => computeIsCompleted(verifiedCount, totalCount),
    [verifiedCount, totalCount]
  );

  const value = useMemo(
    () => ({
      shipments,
      loading,
      error,
      totalCount,
      verifiedCount,
      todayScans,
      progressPercent,
      isCompleted,
      pullOrders,
      reportSyncResult,
    }),
    [
      shipments,
      loading,
      error,
      totalCount,
      verifiedCount,
      todayScans,
      progressPercent,
      isCompleted,
      pullOrders,
      reportSyncResult,
    ]
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrders(): OrderContextValue {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrders must be used within OrderProvider');
  return ctx;
}
