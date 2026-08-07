import React from 'react';

interface ScanCardProps {
  isScanning: boolean;
  error: string | null;
  hint: string;
}

// Kartu viewfinder hasil ekstraksi dari ScannerView lama (UI identik):
// background image, corner guide #FFC79A, scan-line animasi. Kamera asli
// dibuka native oleh ML Kit; kartu ini menampilkan status idle/dibuka.
export const ScanCard: React.FC<ScanCardProps> = ({ isScanning, error, hint }) => {
  return (
    <div className="relative flex-1 bg-white rounded-[24px] border-[3px] border-[#1E1A34] overflow-hidden shadow-[0_8px_0_rgba(30,26,52,0.1)] p-4 flex flex-col items-center justify-center min-h-[300px]">
      {/* Background Image */}
      <img
        className="absolute inset-0 w-full h-full object-cover opacity-60"
        alt="Blurry warehouse with boxes background"
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAcxCOENyt6GKqU5gULxu-tCCSgXDimwKfCD5171VD8uKe9T5PbNMhwRcrSvpzGUcrB9qYkdEE_WddRAHVNpUXASVBVoVaAiYdCyNgog2SJ1fDC6Yd4ui1yX3cDkf_jxM9Z5V2YATVBavwM9HhS3cz6p0RVFn7K0rqAIuVF3HCjs6ULh2UKQ_eZM_mHEaouc26RG89MpqdMspRW0j_nfIeUuB6GOZ373oBFJp0Xf76F7m3iuQjCobEig"
      />

      {/* Idle / error status */}
      {!isScanning && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 p-6">
          <span className="material-symbols-outlined text-[44px] text-[#1E1A34]/60">
            {error ? 'videocam_off' : 'videocam'}
          </span>
          <p className="text-[14px] font-bold text-[#1E1A34]/70 text-center">
            {error ? error : hint}
          </p>
        </div>
      )}

      {/* Scanning Overlay Viewfinder Box */}
      <div className="relative w-[280px] h-[200px] z-10 flex items-center justify-center">
        <div className="absolute top-0 left-0 w-8 h-8 border-t-[4px] border-l-[4px] border-[#FFC79A] rounded-tl-lg"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-[4px] border-r-[4px] border-[#FFC79A] rounded-tr-lg"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[4px] border-l-[4px] border-[#FFC79A] rounded-bl-lg"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[4px] border-r-[4px] border-[#FFC79A] rounded-br-lg"></div>

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
    </div>
  );
};
