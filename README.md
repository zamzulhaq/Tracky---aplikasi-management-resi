# Tracky — Aplikasi Manajemen Resi

Aplikasi Android (APK) untuk manajemen resi & status pengiriman, terintegrasi dengan **WooCommerce REST API**. Dibuat khusus untuk kebutuhan toko **azrahstore**.

Pemindai memakai kamera **native Android (ML Kit)** — bukan video WebView — sehingga preview kamera selalu tampil dengan lancar.

## Fitur

- **Control Center (Home)** — Tarik order dari WooCommerce sekali, data tersimpan selama sesi (tidak ada GET ulang saat pindah mode).
- **Order Scan** — Pindai barcode *label order* (contoh `PO68408` / `68408`) → dialog konfirmasi → status berubah `sudah-lunas` → `sudah-dikirim`.
- **Resi Scan** — Pilih order `sudah-dikirim` dulu, lalu pindai barcode *nomor resi* → dialog konfirmasi → simpan resi **apa adanya** ke meta `_custom_no_resi` + status menjadi `completed`. Nomor resi **tidak dinormalisasi** (tidak di-uppercase / digit-only / hapus prefix kurir) — isi toko memang beragam (`WAHANA Y9LFGX92`, `JNE 022180005802125`, `#CM02795370415`, dst).
- **Duplicate Protection** — Order yang sudah berubah status tidak bisa diproses ulang di mode yang sama.
- **Shipments** — Daftar semua order dengan filter (All / Sudah Lunas / Sudah Dikirim / Completed / **History**) + pencarian.
- **Local History** — Riwayat scan disimpan di localStorage (key `tracky_scan_history`), otomatis menghapus data > 30 hari, dikelompokkan: Hari Ini / Kemarin / 1 Minggu Lalu / Lebih Lama.
- **Navigasi** — Bottom nav (Home, Shipments, Profile). Order Scan & Resi Scan adalah *workspace* (bottom nav disembunyikan, tombol `← Home` untuk kembali).

## Tech Stack

| Bagian | Teknologi |
|---|---|
| Frontend | React 19, TypeScript, Vite 6, Tailwind CSS 4 |
| Container | Capacitor 8 (Android) |
| Scanner | `@capacitor-mlkit/barcode-scanning` (ML Kit native) |
| Backend | WooCommerce REST API (v3) via Basic Auth |

## Struktur Kode

```
src/
├── App.tsx                  # Orkestrator: tab, workspace, dialog konfirmasi, toast
├── components/              # UI (HomeView, OrderScanView, ResiScanView, ShipmentsView, ConfirmDialog, ScanCard, ...)
├── context/OrderContext.tsx # SATU collection order (single source of truth sesi)
├── services/                # wooCommerceClient, matchingService, syncService, historyService, pipeline, ...
├── utils/                   # orderMapping, progress
├── constants/               # filter kategori
└── types.ts                 # tipe bersama
```

## Setup

1. Install dependensi:

   ```bash
   npm install
   ```

2. Buat file `.env` di root:

   ```env
   VITE_WOO_BASE_URL=https://toko-anda.com/wp-json/wc/v3
   VITE_WOO_CONSUMER_KEY=ck_xxx
   VITE_WOO_CONSUMER_SECRET=cs_xxx
   VITE_WOO_FETCH_STATUS=sudah-lunas
   VITE_WOO_FETCH_STATUSES=sudah-lunas,sudah-dikirim,completed
   VITE_WOO_COMPLETE_STATUS=sudah-dikirim
   ```

   > Kredensial adalah REST API keys WooCommerce (WooCommerce → Settings → Advanced → REST API), minimal hak *Read/Write*.

3. Jalankan di browser:

   ```bash
   npm run dev
   ```

## Build APK Android

1. Build web + sync ke Capacitor:

   ```bash
   npm run build
   npx cap sync android
   ```

2. Build APK debug (butuh JDK 21 & Android SDK):

   ```powershell
   $env:JAVA_HOME="C:\Program Files\Microsoft\jdk-21.0.12.8-hotspot"
   $env:ANDROID_HOME="$env:LOCALAPPDATA\Android\Sdk"
   cd android
   .\gradlew.bat assembleDebug --no-daemon
   ```

3. Hasil APK: `android\app\build\outputs\apk\debug\app-debug.apk` (salinan di root: `Tracky-debug.apk`).

## Verifikasi (lint & self-check)

```bash
npm run lint                                   # TypeScript type-check
npx tsx src/services/wooCommerce.test.ts        # + matchingService, syncService, historyService, pipeline, dst.
npx tsx src/utils/orderMapping.test.ts
```

## Alur Status

```
sudah-lunas ──(Order Scan / manual)──▶ sudah-dikirim ──(Resi Scan: isi resi)──▶ completed
```

---

## Lisensi

Hak cipta © 2026 **Azzam Khalifatulhaq — Zamify**. Seluruh hak cipta dilindungi.

Aplikasi ini adalah perangkat lunak proprietari. Dilarang menyalin, memodifikasi, mendistribusikan, atau menggunakan aplikasi ini tanpa izin tertulis dari pemegang hak cipta. Lihat file [`LICENSE`](LICENSE) untuk detail.

Kontak: [zamifyteam@gmail.com](mailto:zamifyteam@gmail.com)
