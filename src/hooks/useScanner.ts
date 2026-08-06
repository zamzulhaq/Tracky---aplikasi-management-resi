import { useCallback, useRef, useState } from 'react';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';

interface UseScannerOptions {
  onResult: (decodedText: string) => void;
}

interface UseScanner {
  isScanning: boolean;
  error: string | null;
  startScan: () => Promise<void>;
}

// Pesan ramah untuk kegagalan scan yang umum, supaya staf tahu sebabnya
// (izin kamera ditolak / kamera tak ada). Lainnya: pesan asli plugin.
export function friendlyScanError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  if (/denied|permission/i.test(message))
    return 'Kamera tidak diizinkan. Buka setelan HP, aktifkan izin kamera untuk Tracky.';
  if (/not.?found|unavailable|no camera/i.test(message))
    return 'Kamera tidak ditemukan atau tidak didukung di perangkat ini.';
  return message || 'Gagal membuka kamera. Coba lagi.';
}

// Scanner engine berbasis ML Kit native (BarcodeScanner.scan) — kamera berjalan
// di layer Android, bukan video WebView, jadi preview selalu tampil (tidak putih).
// UI scan full-screen milik plugin; komponen cukup memanggil startScan().
export function useScanner({ onResult }: UseScannerOptions): UseScanner {
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startScan = useCallback(async () => {
    if (isScanning) return;
    setError(null);
    setIsScanning(true);
    try {
      // autoZoom mempermudah staf membaca label dari jarak dekat.
      const { barcodes } = await BarcodeScanner.scan({ autoZoom: true });
      const value = barcodes[0]?.rawValue ?? barcodes[0]?.displayValue;
      if (value) onResultRef.current(value);
    } catch (err) {
      // Dibatalkan oleh staf (tombol kembali) -> diam; error asli -> tampil.
      const message = friendlyScanError(err);
      if (!/cancel/i.test(message)) setError(message);
    } finally {
      setIsScanning(false);
    }
  }, [isScanning]);

  return { isScanning, error, startScan };
}
