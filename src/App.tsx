import { useState, useEffect } from 'react';
import { App as CapApp } from '@capacitor/app';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './components/HomeView';
import { ShipmentsView } from './components/ShipmentsView';
import { ProfileView } from './components/ProfileView';
import { OrderScanView } from './components/OrderScanView';
import { ResiScanView } from './components/ResiScanView';
import { ConfirmDialog } from './components/ConfirmDialog';
import { useOrders } from './hooks/useOrders';
import { scanPipeline } from './services/pipeline';
import { shipmentToOrder } from './utils/orderMapping';
import { Order, Shipment, TabType } from './types';
import { ScanMode } from './services/syncTypes';

interface PendingConfirm {
  mode: ScanMode;
  order: Order;
  resi?: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const { shipments, reportSyncResult } = useOrders();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(null);

  const isWorkspace = activeTab === 'orderScan' || activeTab === 'resiScan';

  // Tombol back fisik Android: workspace/tab lain -> Home; di Home -> keluar.
  useEffect(() => {
    const listener = CapApp.addListener('backButton', () => {
      if (activeTab !== 'home') {
        setActiveTab('home');
      } else {
        void CapApp.exitApp();
      }
    });
    return () => {
      void listener.then((h) => h.remove());
    };
  }, [activeTab]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // ORDER Scan: scan label -> match -> cek duplicate -> dialog konfirmasi.
  const handleOrderScanCode = async (code: string) => {
    const verification = await scanPipeline.match(code);
    if (!verification.verified || !verification.order) {
      showToast('Nomor order tidak ditemukan. Cek label atau order sudah diproses.');
      return;
    }
    const order = verification.order;
    const current = shipments.find((s) => s.id === order.orderId);
    if (current && current.status !== 'Sudah Lunas') {
      showToast(`Order #${order.orderId} sudah diproses (${current.status}).`);
      return;
    }
    setPendingConfirm({ mode: 'ORDER', order });
  };

  // RESI Scan: pilih order sudah-dikirim -> scan resi -> dialog konfirmasi.
  const handleResiScan = (order: Shipment, resi: string) => {
    const current = shipments.find((s) => s.id === order.id);
    if (current && current.status !== 'Sudah Dikirim') {
      showToast(`Order #${order.id} sudah ${current.status}.`);
      return;
    }
    if (!resi.trim()) {
      showToast('Barcode resi kosong. Coba scan ulang.');
      return;
    }
    setPendingConfirm({ mode: 'RESI', order: shipmentToOrder(order), resi });
  };

  const handleConfirm = async () => {
    if (!pendingConfirm) return;
    const { mode, order, resi } = pendingConfirm;
    setPendingConfirm(null);
    const result = await scanPipeline.commit(order, { mode, resi });
    reportSyncResult(result, { mode, resi });
    if (result.success) {
      showToast(
        mode === 'ORDER'
          ? `#${order.orderNumber} · ${order.customerName} → Sudah Dikirim`
          : `#${order.orderNumber} · Resi disimpan → Selesai`
      );
    } else if (result.reason === 'UPDATE_FAILED') {
      showToast('Gagal update ke WooCommerce. Coba lagi.');
    } else {
      showToast('Sync gagal. Periksa koneksi.');
    }
  };

  const headerTitle =
    activeTab === 'home'
      ? 'Tracky'
      : activeTab === 'orderScan'
      ? 'Order Scan'
      : activeTab === 'resiScan'
      ? 'Resi Scan'
      : activeTab === 'shipments'
      ? 'Shipments'
      : 'Profile';

  return (
    <div className="relative min-h-screen bg-white text-[#1E1A34] overflow-x-hidden antialiased font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Background Organic Blobs */}
      <div className="organic-blob-1" />
      <div className="organic-blob-2" />

      {/* Mobile App Viewport Container */}
      <div
        className={`relative z-10 flex flex-col min-h-screen max-w-md mx-auto w-full ${
          isWorkspace ? '' : 'pb-[100px]'
        }`}
      >
        {/* Sticky Header */}
        <Header
          title={headerTitle}
          onBack={activeTab !== 'home' ? () => setActiveTab('home') : undefined}
          onSettings={() => setActiveTab('profile')}
        />

        {/* Dynamic View Canvas */}
        <main className="flex-1 flex flex-col relative">
          {activeTab === 'orderScan' && (
            <OrderScanView
              orders={shipments.filter((s) => s.status === 'Sudah Lunas')}
              onScanCode={handleOrderScanCode}
            />
          )}

          {activeTab === 'resiScan' && (
            <ResiScanView
              orders={shipments.filter((s) => s.status === 'Sudah Dikirim')}
              onScanResi={handleResiScan}
            />
          )}

          {activeTab === 'home' && (
            <HomeView
              shipments={shipments}
              onGoToOrderScan={() => setActiveTab('orderScan')}
              onGoToResiScan={() => setActiveTab('resiScan')}
              onGoToShipments={() => setActiveTab('shipments')}
            />
          )}

          {activeTab === 'shipments' && (
            <ShipmentsView
              shipments={shipments}
              onGoToOrderScan={() => setActiveTab('orderScan')}
            />
          )}

          {activeTab === 'profile' && <ProfileView />}
        </main>

        {/* Floating Bottom Nav (disembunyikan di workspace) */}
        {!isWorkspace && <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />}
      </div>

      {/* Dialog Konfirmasi (Order Scan & Resi Scan) */}
      <ConfirmDialog
        open={pendingConfirm !== null}
        mode={pendingConfirm?.mode ?? 'ORDER'}
        order={pendingConfirm?.order ?? null}
        resi={pendingConfirm?.resi}
        onConfirm={handleConfirm}
        onCancel={() => setPendingConfirm(null)}
      />

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#1E1A34] text-white font-bold text-[13px] px-5 py-3 rounded-full border-[2.5px] border-[#FFC79A] shadow-xl animate-in fade-in slide-in-from-top-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-[#FFC79A]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
