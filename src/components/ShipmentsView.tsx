import React, { useState } from 'react';
import { Shipment } from '../types';
import { FILTER_CATEGORIES } from '../constants/shipments';
import { groupHistory, loadHistory } from '../services/historyService';

interface ShipmentsViewProps {
  shipments: Shipment[];
  onGoToOrderScan: () => void;
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts;
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const ShipmentsView: React.FC<ShipmentsViewProps> = ({
  shipments,
  onGoToOrderScan,
}) => {
  const [filter, setFilter] = useState<string>('All');
  const [search, setSearch] = useState<string>('');

  // Local History dibaca saat render (data berubah tiap scan selesai).
  const history = loadHistory();
  const historySections = groupHistory(history);
  const isHistory = filter === 'History';

  const filtered = shipments.filter((item) => {
    const matchesFilter = filter === 'All' || item.status === filter;
    const matchesSearch =
      item.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
      item.recipient.toLowerCase().includes(search.toLowerCase()) ||
      item.destination.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col p-5 gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[28px] font-bold text-[#1E1A34]">Shipments</h2>
        <button
          onClick={onGoToOrderScan}
          className="bg-[#FFC79A] text-[#1E1A34] font-bold text-[13px] px-4 py-2 rounded-full border-[2.5px] border-[#1E1A34] flex items-center gap-1.5 shadow-[0_3px_0_#1E1A34] active:translate-y-0.5 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">edit_square</span>
          Input Nomor
        </button>
      </div>

      {/* Search Input (tidak dipakai di tab History) */}
      {!isHistory && (
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search by tracking #, recipient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-[20px] border-[2.5px] border-[#1E1A34] bg-white font-medium text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FFC79A]"
          />
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {FILTER_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[12px] font-bold border-[2px] border-[#1E1A34] transition-all cursor-pointer ${
              filter === cat
                ? 'bg-[#1E1A34] text-white'
                : 'bg-white text-[#1E1A34] hover:bg-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* History List */}
      {isHistory && (
        <div className="flex flex-col gap-4">
          {historySections.length === 0 ? (
            <div className="bg-white rounded-[24px] border-[3px] border-[#1E1A34] p-8 text-center">
              <span className="material-symbols-outlined text-[48px] text-gray-400 mb-2">
                history
              </span>
              <p className="font-bold text-[16px] text-[#1E1A34]">Belum ada history</p>
              <p className="text-[13px] text-gray-500 mt-1">
                History tersimpan otomatis setiap scan berhasil.
              </p>
            </div>
          ) : (
            historySections.map((section) => (
              <div key={section.label}>
                <h4 className="text-[14px] font-bold text-[#1E1A34] mb-2">{section.label}</h4>
                <div className="flex flex-col gap-3">
                  {section.entries.map((entry) => (
                    <div
                      key={`${entry.timestamp}-${entry.orderId}`}
                      className="bg-white rounded-[20px] border-[3px] border-[#1E1A34] p-4 shadow-[0_4px_0_rgba(30,26,52,0.05)] flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border-[1.5px] border-[#1E1A34] ${
                            entry.mode === 'RESI' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {entry.mode === 'RESI' ? 'RESI' : 'ORDER'}
                        </span>
                        <span className="text-[12px] font-semibold text-gray-500">
                          {formatTimestamp(entry.timestamp)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-[15px] text-[#1E1A34]">#{entry.orderId}</p>
                          <p className="text-[12px] text-gray-600 font-medium">{entry.customerName}</p>
                          {entry.trackingNumber && (
                            <p className="text-[12px] text-gray-500 font-medium truncate">
                              {entry.trackingNumber}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-[12px] font-bold text-gray-500">
                            {entry.statusBefore} → {entry.statusAfter}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Shipments List */}
      {!isHistory && (
        <div className="flex flex-col gap-3">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-[24px] border-[3px] border-[#1E1A34] p-8 text-center">
              <span className="material-symbols-outlined text-[48px] text-gray-400 mb-2">
                package_2
              </span>
              <p className="font-bold text-[16px] text-[#1E1A34]">No shipments found</p>
              <p className="text-[13px] text-gray-500 mt-1">Try resetting search or adding a new tracking code.</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-[24px] border-[3px] border-[#1E1A34] p-4 shadow-[0_4px_0_rgba(30,26,52,0.08)] flex flex-col gap-3"
              >
                <div className="flex items-center justify-between border-b-[2px] border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-[#1E1A34]">
                      barcode
                    </span>
                    <span className="font-bold text-[16px] text-[#1E1A34]">{item.trackingNumber}</span>
                  </div>
                  <span className="bg-[#FFDCC2] text-[#2E1500] text-[11px] font-bold px-3 py-1 rounded-full border-[1.5px] border-[#1E1A34]">
                    {item.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[13px]">
                  <div>
                    <p className="text-gray-500 font-medium text-[11px]">Recipient</p>
                    <p className="font-bold text-[#1E1A34]">{item.recipient}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium text-[11px]">Destination</p>
                    <p className="font-bold text-[#1E1A34]">{item.destination}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium text-[11px]">Package Info</p>
                    <p className="font-semibold text-[#1E1A34]">{item.type} ({item.weight})</p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium text-[11px]">Estimated ETA</p>
                    <p className="font-semibold text-[#1E1A34]">{item.eta}</p>
                  </div>
                </div>

                {item.scannedAt && (
                  <div className="bg-slate-50 rounded-[12px] p-2 text-[11px] text-gray-600 font-medium flex items-center justify-between">
                    <span>Last Scanned:</span>
                    <span className="font-bold text-[#1E1A34]">{item.scannedAt}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
