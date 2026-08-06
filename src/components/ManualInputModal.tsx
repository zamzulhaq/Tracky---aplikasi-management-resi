import React, { useState } from 'react';

interface ManualInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (orderNumber: string) => void;
}

// Fallback saat barcode label gagal terbaca: ketik nomor order (mis. 68408).
// Jalur yang sama seperti scan — App menjalankan scanPipeline (match -> PUT
// status sudah-dikirim ke WooCommerce).
export const ManualInputModal: React.FC<ManualInputModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [orderNumber, setOrderNumber] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = orderNumber.trim();
    if (!code) return;
    onSubmit(code);
    setOrderNumber('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white border-t-[3px] sm:border-[3px] border-[#1E1A34] rounded-t-[32px] sm:rounded-[32px] w-full max-w-md p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full border-[2px] border-[#1E1A34] flex items-center justify-center font-bold text-[#1E1A34] hover:bg-slate-100 cursor-pointer"
        >
          ✕
        </button>

        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-[28px] text-[#1E1A34]">edit_square</span>
          <h3 className="text-[20px] font-bold text-[#1E1A34]">Input Nomor Order</h3>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[13px] font-bold text-[#1E1A34] mb-1">
              Nomor Order *
            </label>
            <input
              type="text"
              required
              autoFocus
              inputMode="numeric"
              placeholder="e.g. 68408"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full px-4 py-3 rounded-[16px] border-[2.5px] border-[#1E1A34] font-medium text-[15px] focus:outline-none focus:ring-2 focus:ring-[#FFC79A]"
            />
            <p className="text-[12px] text-gray-500 font-medium mt-1">
              Nomor order ada di label paket (PO # 68408). Paket langsung ditandai Sudah Dikirim.
            </p>
          </div>

          <div className="flex gap-3 mt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-full border-[2.5px] border-[#1E1A34] font-bold text-[#1E1A34] hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-full border-[2.5px] border-[#1E1A34] bg-[#FFC79A] font-bold text-[#1E1A34] hover:bg-[#ffb67b] shadow-[0_3px_0_#1E1A34] active:translate-y-0.5 cursor-pointer"
            >
              Tandai Sudah Dikirim
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
