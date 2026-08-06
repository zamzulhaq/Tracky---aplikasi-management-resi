import React, { useState } from 'react';
import { useScanner } from '../hooks/useScanner';
import { useOrders } from '../hooks/useOrders';
import { scanPipeline } from '../services/pipeline';
import { SyncResult } from '../services/syncTypes';

interface ScannerViewProps {
  onScanComplete: (scannedCode: string) => void;
  onOpenManualInput: () => void;
}

export const ScannerView: React.FC<ScannerViewProps> = ({
  onScanComplete,
  onOpenManualInput,
}) => {
  const [scanResult, setScanResult] = useState<SyncResult | null>(null);
  const { reportSyncResult } = useOrders();

  const handleScanResult = async (decodedText: string) => {
    const result = await scanPipeline.run(decodedText.trim());
    reportSyncResult(result);
    setScanResult(result);
    onScanComplete(decodedText);
  };

  const { isScanning, error, startScan } = useScanner({ onResult: handleScanResult });

  const handleStart = async () => {
    if (scanResult) setScanResult(null);
    await startScan();
  };

  return (
    <div className="flex-1 flex flex-col p-5 gap-6 relative">
      <h2 className="text-[28px] font-bold text-[#1E1A34] text-center">
        Scanner
      </h2>

      {/* Camera Viewfinder — preview live ada di UI native ML Kit saat scan,
          kartu ini menampilkan status idle/hasil di aplikasi. */}
      <div className="relative flex-1 bg-white rounded-[24px] border-[3px] border-[#1E1A34] overflow-hidden shadow-[0_8px_0_rgba(30,26,52,0.1)] p-4 flex flex-col items-center justify-center min-h-[380px]">
        {/* Background Image matching requested mockup exact hotlink URL */}
        <img
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          alt="Blurry warehouse with boxes background"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAcxCOENyt6GKqU5gULxu-tCCSgXDimwKfCD5171VD8uKe9T5PbNMhwRcrSvpzGUcrB9qYkdEE_WddRAHVNpUXASVBVoVaAiYdCyNgog2SJ1fDC6Yd4ui1yX3cDkf_jxM9Z5V2YATVBavwM9HhS3cz6p0RVFn7K0rqAIuVF3HCjs6ULh2UKQ_eZM_mHEaouc26RG89MpqdMspRW0j_nfIeUuB6GOZ373oBFJp0Xf76F7m3iuQjCobEig"
        />

        {/* Idle / error status — kamera native dibuka lewat tombol Scan */}
        {!isScanning && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 p-6">
            <span className="material-symbols-outlined text-[44px] text-[#1E1A34]/60">
              {error ? 'videocam_off' : 'videocam'}
            </span>
            <p className="text-[14px] font-bold text-[#1E1A34]/70 text-center">
              {error
                ? error
                : scanResult
                ? 'Scan selesai — tekan Scan Lagi untuk paket berikutnya.'
                : 'Kamera mati — tekan Mulai Scan untuk menyalakan kamera.'}
            </p>
          </div>
        )}

        {/* Scanning Overlay Viewfinder Box */}
        <div className="relative w-[280px] h-[200px] z-10 flex items-center justify-center">
          {/* Corner Guides with exact peach accent #FFC79A */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-[4px] border-l-[4px] border-[#FFC79A] rounded-tl-lg"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-[4px] border-r-[4px] border-[#FFC79A] rounded-tr-lg"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[4px] border-l-[4px] border-[#FFC79A] rounded-bl-lg"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[4px] border-r-[4px] border-[#FFC79A] rounded-br-lg"></div>

          {/* Animated Scan Line */}
          {isScanning && (
            <div className="scan-line absolute left-0 right-0 h-[2px] bg-[#FFC79A] shadow-[0_0_12px_#FFC79A] z-20"></div>
          )}
        </div>

        {/* Progress Indicator */}
        {isScanning && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-[#1E1A34] text-white text-[14px] font-semibold px-6 py-3 rounded-full border-[3px] border-[#1E1A34] flex items-center gap-3 z-20 shadow-[0_4px_0_rgba(0,0,0,0.2)]">
            <span
              className="material-symbols-outlined animate-spin text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              sync
            </span>
            <span>Membuka kamera...</span>
          </div>
        )}

        {/* Result Badge */}
        {!isScanning && scanResult && (
          <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-[20px] p-4 border-[3px] border-[#1E1A34] z-20 shadow-lg animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between mb-2">
              <span className="bg-[#FFC79A] text-[#1E1A34] font-bold text-[12px] px-3 py-1 rounded-full border-[2px] border-[#1E1A34]">
                Barcode Detected!
              </span>
              <button
                onClick={handleStart}
                className="text-[12px] font-bold text-[#1E1A34] underline hover:opacity-80"
              >
                Scan Again
              </button>
            </div>
            <p className="font-bold text-[18px] text-[#1E1A34]">
              {scanResult.verification.order?.trackingNumber ?? scanResult.verification.trackingNumber}
            </p>
            <p className="text-[13px] text-gray-700 font-medium">
              Recipient: {scanResult.verification.order?.customerName ?? 'Unknown'} (
              {scanResult.verification.order?.destination ?? 'Unknown'})
            </p>
          </div>
        )}
      </div>

      {/* Control Action Buttons */}
      <div className="flex flex-col gap-3 z-10">
        <button
          onClick={handleStart}
          disabled={isScanning}
          className="w-full bg-[#1E1A34] text-white rounded-full border-[3px] border-[#1E1A34] py-4 px-6 flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-[0_4px_0_rgba(30,26,52,0.15)] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span
            className="material-symbols-outlined font-bold text-[22px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {isScanning ? 'sync' : scanResult ? 'replay' : 'videocam'}
          </span>
          <span className="text-[15px] font-bold">
            {isScanning ? 'Scanning...' : scanResult ? 'Scan Lagi' : 'Mulai Scan'}
          </span>
        </button>

        <button
          onClick={onOpenManualInput}
          className="w-full bg-[#FFC79A] hover:bg-[#ffb67b] rounded-full border-[3px] border-[#1E1A34] py-4 px-6 flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-[0_4px_0_rgba(30,26,52,0.1)] cursor-pointer"
        >
          <span
            className="material-symbols-outlined font-bold text-[22px] text-[#1E1A34]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            edit_square
          </span>
          <span className="text-[15px] font-bold text-[#1E1A34]">Input Manual</span>
        </button>
      </div>
    </div>
  );
};
