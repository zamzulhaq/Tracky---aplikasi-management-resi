import { useState, useEffect } from 'react';
import { App as CapApp } from '@capacitor/app';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { ScannerView } from './components/ScannerView';
import { HomeView } from './components/HomeView';
import { ShipmentsView } from './components/ShipmentsView';
import { ProfileView } from './components/ProfileView';
import { ManualInputModal } from './components/ManualInputModal';
import { useOrders } from './hooks/useOrders';
import { scanPipeline } from './services/pipeline';
import { TabType } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const { shipments, reportSyncResult } = useOrders();
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Tombol back fisik Android: jika bukan di Home -> ke Home; jika di Home -> keluar aplikasi.
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

  const handleScanComplete = (trackingNumber: string) => {
    showToast(`Scanned Code: ${trackingNumber}`);
  };

  // Input manual = fallback scan label: nomor order diketik -> jalur yang sama
  // seperti scan (match -> PUT status sudah-dikirim ke WooCommerce).
  const handleManualSubmit = async (orderNumber: string) => {
    const result = await scanPipeline.run(orderNumber.trim());
    reportSyncResult(result);
    if (result.success) {
      const o = result.verification.order;
      showToast(`#${orderNumber} · ${o?.customerName ?? 'Paket'} → Sudah Dikirim`);
    } else {
      showToast(`Nomor order tidak ditemukan: ${orderNumber}`);
    }
  };

  return (
    <div className="relative min-h-screen bg-white text-[#1E1A34] overflow-x-hidden antialiased font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Background Organic Blobs */}
      <div className="organic-blob-1" />
      <div className="organic-blob-2" />

      {/* Mobile App Viewport Container */}
      <div className="relative z-10 flex flex-col min-h-screen max-w-md mx-auto w-full pb-[100px]">
        {/* Sticky Header */}
        <Header
          title={
            activeTab === 'scanner'
              ? 'Tracky'
              : activeTab === 'home'
              ? 'Tracky'
              : activeTab === 'shipments'
              ? 'Shipments'
              : 'Profile'
          }
          onBack={activeTab !== 'home' ? () => setActiveTab('home') : undefined}
          onSettings={() => setActiveTab('profile')}
        />

        {/* Dynamic View Canvas */}
        <main className="flex-1 flex flex-col relative">
          {activeTab === 'scanner' && (
            <ScannerView
              onScanComplete={handleScanComplete}
              onOpenManualInput={() => setIsManualModalOpen(true)}
            />
          )}

          {activeTab === 'home' && (
            <HomeView
              shipments={shipments}
              onGoToScanner={() => setActiveTab('scanner')}
              onGoToShipments={() => setActiveTab('shipments')}
            />
          )}

          {activeTab === 'shipments' && (
            <ShipmentsView
              shipments={shipments}
              onOpenManualInput={() => setIsManualModalOpen(true)}
            />
          )}

          {activeTab === 'profile' && <ProfileView />}
        </main>

        {/* Floating Bottom Nav */}
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Manual Barcode Input Modal */}
      <ManualInputModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSubmit={handleManualSubmit}
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

