import React from 'react';
import { Order } from '../types';

interface ConfirmDialogProps {
  open: boolean;
  mode: 'ORDER' | 'RESI';
  order: Order | null;
  resi?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

// Dialog konfirmasi sebelum commit ke WooCommerce (Order Scan & Resi Scan).
// Styling mengikuti design system: bottom sheet, border hitam, aksen #FFC79A.
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  mode,
  order,
  resi,
  onConfirm,
  onCancel,
}) => {
  if (!open || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white border-t-[3px] sm:border-[3px] border-[#1E1A34] rounded-t-[32px] sm:rounded-[32px] w-full max-w-md p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onCancel}
          className="absolute top-5 right-5 w-9 h-9 rounded-full border-[2px] border-[#1E1A34] flex items-center justify-center font-bold text-[#1E1A34] hover:bg-slate-100 cursor-pointer"
          aria-label="Batal"
        >
          ✕
        </button>

        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-[28px] text-[#1E1A34]">
            {mode === 'ORDER' ? 'barcode_scanner' : 'qr_code_scanner'}
          </span>
          <h3 className="text-[20px] font-bold text-[#1E1A34]">
            {mode === 'ORDER' ? 'Konfirmasi Order' : 'Konfirmasi Resi'}
          </h3>
        </div>

        <div className="flex flex-col gap-3">
          <div className="bg-slate-50 rounded-[16px] border-[2px] border-[#1E1A34] p-4 flex flex-col gap-1">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Nomor Order</p>
            <p className="font-bold text-[18px] text-[#1E1A34]">{order.orderNumber}</p>
          </div>

          <div className="bg-slate-50 rounded-[16px] border-[2px] border-[#1E1A34] p-4 flex flex-col gap-1">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Customer</p>
            <p className="font-bold text-[15px] text-[#1E1A34]">{order.customerName}</p>
            <p className="text-[13px] text-gray-600 font-medium">{order.destination}</p>
          </div>

          {mode === 'RESI' && (
            <div className="bg-[#FFDCC2] rounded-[16px] border-[2px] border-[#1E1A34] p-4 flex flex-col gap-1">
              <p className="text-[11px] font-bold text-[#2E1500] uppercase tracking-wider">Nomor Resi</p>
              <p className="font-bold text-[16px] text-[#1E1A34] break-all">{resi}</p>
              <p className="text-[12px] text-[#2E1500] font-medium">
                Disimpan apa adanya seperti hasil scan.
              </p>
            </div>
          )}

          <div className="flex gap-3 mt-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-full border-[2.5px] border-[#1E1A34] font-bold text-[#1E1A34] hover:bg-slate-100 cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 rounded-full border-[2.5px] border-[#1E1A34] bg-[#FFC79A] font-bold text-[#1E1A34] hover:bg-[#ffb67b] shadow-[0_3px_0_#1E1A34] active:translate-y-0.5 cursor-pointer"
            >
              Konfirmasi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
