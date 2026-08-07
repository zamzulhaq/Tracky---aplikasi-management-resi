import React from 'react';
import { Shipment } from '../types';
import { useOrders } from '../hooks/useOrders';

interface HomeViewProps {
  shipments: Shipment[];
  onGoToOrderScan: () => void;
  onGoToResiScan: () => void;
  onGoToShipments: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  shipments,
  onGoToOrderScan,
  onGoToResiScan,
  onGoToShipments,
}) => {
  // Aktif = belum selesai dikirim (Sudah Lunas menunggu scan, In Transit manual).
  const activeShipments = shipments.filter(
    (s) => s.status !== 'Completed' && s.status !== 'Sudah Dikirim'
  );
  const { loading, error, totalCount, verifiedCount, todayScans, progressPercent, isCompleted, pullOrders } = useOrders();

  return (
    <div className="flex-1 flex flex-col p-5 gap-6">
      {/* Welcome Banner */}
      <div className="bg-[#1E1A34] text-white p-5 rounded-[24px] border-[3px] border-[#1E1A34] relative overflow-hidden shadow-[0_6px_0_rgba(30,26,52,0.15)]">
        <div className="relative z-10">
          <span className="bg-[#FFC79A] text-[#1E1A34] font-bold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider">
            Operator Active
          </span>
          <h2 className="text-[22px] font-bold mt-2">Tracky</h2>
          <p className="text-[13px] text-gray-300 font-medium mt-1">
            Ready to scan incoming & outgoing warehouse shipments.
          </p>

          {/* Control Center: Order Scan & Resi Scan (workspace) */}
          <button
            onClick={onGoToOrderScan}
            className="mt-4 bg-[#FFC79A] text-[#1E1A34] font-bold text-[14px] px-5 py-2.5 rounded-full border-[2px] border-[#1E1A34] flex items-center gap-2 hover:bg-[#ffb67b] cursor-pointer active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              barcode_scanner
            </span>
            Order Scan
          </button>
          <button
            onClick={onGoToResiScan}
            className="mt-2 bg-white text-[#1E1A34] font-bold text-[14px] px-5 py-2.5 rounded-full border-[2px] border-[#1E1A34] flex items-center gap-2 hover:bg-[#ffe9da] cursor-pointer active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              qr_code_scanner
            </span>
            Resi Scan
          </button>
        </div>
      </div>

      {/* Pull Orders from WooCommerce */}
      <div className="bg-white p-4 rounded-[20px] border-[3px] border-[#1E1A34] shadow-[0_4px_0_rgba(30,26,52,0.08)]">
        <button
          onClick={pullOrders}
          disabled={loading}
          className="w-full bg-[#FFC79A] text-[#1E1A34] font-bold text-[14px] px-5 py-3 rounded-full border-[3px] border-[#1E1A34] flex items-center justify-center gap-2 hover:bg-[#ffb67b] active:scale-95 transition-transform shadow-[0_4px_0_rgba(30,26,52,0.1)] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span
            className={`material-symbols-outlined text-[20px] ${loading ? 'animate-spin' : ''}`}
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {loading ? 'sync' : 'download'}
          </span>
          {loading ? 'Mengambil Orderan...' : 'Tarik Orderan Siap Kirim'}
        </button>

        {error && (
          <p className="mt-2 text-[12px] font-bold text-red-600">{error}</p>
        )}
        {!error && totalCount !== null && totalCount > 0 && (
          <p className="mt-2 text-[12px] font-bold text-[#1E1A34]">
            {isCompleted ? 'Semua paket terverifikasi' : `${progressPercent}% terverifikasi`} ·{' '}
            {verifiedCount}/{totalCount} Paket Verified
          </p>
        )}
        {!error && totalCount === 0 && (
          <p className="mt-2 text-[12px] font-bold text-[#1E1A34]">
            Tidak ada order sudah-lunas saat ini.
          </p>
        )}
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-[20px] border-[3px] border-[#1E1A34] shadow-[0_4px_0_rgba(30,26,52,0.08)]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[12px] font-bold text-gray-600">Active Parcels</span>
            <span className="material-symbols-outlined text-[#1E1A34]">local_shipping</span>
          </div>
          <p className="text-[28px] font-bold text-[#1E1A34]">{activeShipments.length}</p>
        </div>

        <div className="bg-[#FFDCC2] p-4 rounded-[20px] border-[3px] border-[#1E1A34] shadow-[0_4px_0_rgba(30,26,52,0.08)]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[12px] font-bold text-[#2E1500]">Today's Scans</span>
            <span className="material-symbols-outlined text-[#2E1500]">qr_code_scanner</span>
          </div>
          <p className="text-[28px] font-bold text-[#2E1500]">{todayScans}</p>
        </div>
      </div>

      {/* Recent Activity List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[18px] font-bold text-[#1E1A34]">Recent Parcels</h3>
          <button
            onClick={onGoToShipments}
            className="text-[13px] font-bold text-[#1E1A34] underline hover:opacity-80"
          >
            View All
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {shipments.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 rounded-[20px] border-[3px] border-[#1E1A34] flex items-center justify-between shadow-[0_4px_0_rgba(30,26,52,0.05)]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E6DEFF] border-[2px] border-[#1E1A34] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px] text-[#1E1A34]">
                    package_2
                  </span>
                </div>
                <div>
                  <p className="font-bold text-[15px] text-[#1E1A34]">{item.trackingNumber}</p>
                  <p className="text-[12px] text-gray-600 font-medium">{item.recipient}</p>
                </div>
              </div>

              <span
                className={`text-[11px] font-bold px-3 py-1 rounded-full border-[1.5px] border-[#1E1A34] ${
                  item.status === 'Completed' || item.status === 'Sudah Dikirim'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
