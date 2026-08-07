import React, { useState } from 'react';
import { Shipment } from '../types';
import { useScanner } from '../hooks/useScanner';
import { ScanCard } from './ScanCard';

interface ResiScanViewProps {
  orders: Shipment[];
  onScanResi: (order: Shipment, resi: string) => void;
}

// Workspace Resi Scan (Sprint 12): user PILIH order sudah-dikirim dulu, baru
// memindai barcode NOMOR RESI (bukan label order). Resi disimpan apa adanya.
export const ResiScanView: React.FC<ResiScanViewProps> = ({ orders, onScanResi }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const { isScanning, error, startScan } = useScanner({
    onResult: (code) => {
      const selected = orders.find((o) => o.id === selectedId);
      if (selected) onScanResi(selected, code);
    },
  });

  const selectedOrder = orders.find((o) => o.id === selectedId) ?? null;

  const handleStart = async () => {
    if (!selectedOrder) return;
    await startScan();
  };

  const filtered = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.recipient.toLowerCase().includes(search.toLowerCase()) ||
      o.destination.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col p-5 gap-5">
      <h2 className="text-[28px] font-bold text-[#1E1A34] text-center">Resi Scan</h2>
      <p className="text-[13px] text-gray-600 font-medium text-center -mt-3">
        Pilih order sudah-dikirim, lalu pindai nomor resi untuk menandai selesai.
      </p>

      <ScanCard
        isScanning={isScanning}
        error={error}
        hint={
          selectedOrder
            ? 'Pindai nomor resi (mis. WAHANA Y9LFGX92) — akan disimpan apa adanya.'
            : 'Pilih order di bawah dulu, baru kamera bisa dinyalakan.'
        }
      />

      <div className="flex flex-col gap-3 z-10">
        <button
          onClick={handleStart}
          disabled={isScanning || !selectedOrder}
          className="w-full bg-[#1E1A34] text-white rounded-full border-[3px] border-[#1E1A34] py-4 px-6 flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-[0_4px_0_rgba(30,26,52,0.15)] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span
            className="material-symbols-outlined font-bold text-[22px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {isScanning ? 'sync' : 'qr_code_scanner'}
          </span>
          <span className="text-[15px] font-bold">
            {isScanning ? 'Scanning...' : selectedOrder ? 'Scan Resi' : 'Pilih Order Dulu'}
          </span>
        </button>
      </div>

      {/* Pilihan order sudah-dikirim */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[18px] font-bold text-[#1E1A34]">Sudah Dikirim</h3>
          <span className="text-[13px] font-bold text-[#1E1A34] bg-[#FFDCC2] px-3 py-1 rounded-full border-[2px] border-[#1E1A34]">
            {filtered.length} Order
          </span>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Cari nomor order, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-[20px] border-[2.5px] border-[#1E1A34] bg-white font-medium text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FFC79A]"
          />
        </div>

        <div className="flex flex-col gap-3">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-[20px] border-[3px] border-[#1E1A34] p-6 text-center">
              <p className="font-bold text-[14px] text-[#1E1A34]">
                {orders.length === 0
                  ? 'Belum ada order sudah-dikirim.'
                  : 'Tidak ada hasil untuk pencarian ini.'}
              </p>
            </div>
          ) : (
            filtered.map((o) => {
              const active = o.id === selectedId;
              return (
                <button
                  key={o.id}
                  onClick={() => setSelectedId(active ? null : o.id)}
                  className={`text-left bg-white p-4 rounded-[20px] border-[3px] border-[#1E1A34] flex items-center justify-between shadow-[0_4px_0_rgba(30,26,52,0.05)] cursor-pointer transition-all ${
                    active ? 'bg-[#FFDCC2]' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-white border-[2px] border-[#1E1A34] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px] text-[#1E1A34]">
                        {active ? 'check_circle' : 'package_2'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-[15px] text-[#1E1A34]">#{o.id}</p>
                      <p className="text-[12px] text-gray-600 font-medium truncate">{o.recipient}</p>
                      <p className="text-[12px] text-gray-500 font-medium truncate">{o.destination}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full border-[1.5px] border-[#1E1A34] bg-emerald-100 text-emerald-800 shrink-0">
                    {o.status}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
