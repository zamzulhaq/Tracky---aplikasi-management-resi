# ARCHITECTURE.md

Dokumen ini menjelaskan struktur folder, tanggung jawab masing-masing layer,
aturan coding, dan alur data proyek Tracky. Disiapkan agar project
siap memasuki tahap integrasi backend: WooCommerce REST API, Firebase Firestore,
dan Gemini OCR.

## 1. Struktur Folder

```
src/
  main.tsx                  # Entry point React (wraps OrderProvider)
  App.tsx                   # Komposisi root + state tab; shipments dari OrderContext
  index.css                 # Tailwind v4 + utility custom (blob, scan-line)
  types.ts                  # Kontrak domain: Shipment, TabType, Order
  components/               # UI murni, tanpa logic data
    Header.tsx
    BottomNav.tsx
    HomeView.tsx
    ScannerView.tsx
    ShipmentsView.tsx
    ProfileView.tsx
    ManualInputModal.tsx
  constants/                # Literal bersama (dipakai >1 tempat)
    shipments.ts            #   FILTER_CATEGORIES (filter pills ShipmentsView)
  services/                 # Komunikasi dengan backend
    config.ts               #   WooCommerce config (dari env vars)
    wooCommerceClient.ts    #   HTTP client WooCommerce (tanpa logic, timeout)
    wooCommerceRepository.ts#   Repo WooCommerce: pullOrders() (fetch+cache) & getAllOrders() (baca cache)
    orderRepository.ts      #   Interface OrderRepository
    matchingService.ts      #   Matching Engine (normalisasi + match)
    verificationTypes.ts    #   Tipe VerificationResult + reason
    verificationService.ts  #   Verification Engine (business rule kelayakan order)
    syncTypes.ts            #   Tipe SyncResult + reason
    syncService.ts          #   Sync Engine (orkestrator: WooCommerce + history, DI)
    pipeline.ts             #   Application Flow: match -> verify -> sync (SATU-SATUNYA pintu masuk UI)
    index.ts                #   Barrel + wiring default (orderRepository stateful bersama)
  hooks/                    # Custom hooks: bungkus state + engine
    useScanner.ts           #   Scanner engine (ML Kit native BarcodeScanner.scan)
    useOrders.ts            #   Consumer OrderContext (re-export)
  context/                  # State global antar view
    OrderContext.tsx        #   OrderProvider + useOrders (shipments, pullOrders, addShipment)
    index.ts
  router/                   # Routing (placeholder — saat ini navigasi tab di App.tsx)
    index.ts
  utils/                    # Pure helper tanpa side effect
    orderMapping.ts         #   SATU-SATUNYA mapping Order -> Shipment
    index.ts
```

## 2. Tanggung Jawab Folder

| Folder | Tanggung jawab | Miliknya apa |
| --- | --- | --- |
| `components/` | Render UI & event handling. Tidak boleh memanggil API langsung, tidak menyimpan data domain. | Komponen `View`, `Header`, `Modal` |
| `constants/` | Literal yang dipakai lintas file: kategori filter, (nanti) design token, label status, nilai default. | `FILTER_CATEGORIES` |
| `services/` | Satu modul per backend. Hanya komunikasi HTTP/Firebase/Gemini + transformasi data. Tanpa state. | `woocommerce.ts`, `firebase.ts`, `gemini.ts` |
| `hooks/` | Bungkus state + pemanggilan services agar component tetap ramping. | `useShipments`, `useScanner` (nanti) |
| `context/` | State global yang dibagikan banyak view (mis. data shipments) — pengganti prop drilling. | `OrderContext` |
| `router/` | Navigasi. Saat ini tab-based; router ditambah saat butuh deep-link/APK. | kosong (placeholder) |
| `utils/` | Pure function tanpa side effect & tanpa React. | format tanggal, normalisasi nomor resi, base64 (nanti) |
| `types.ts` | Seluruh kontrak data. Satu-satunya tempat mendefinisikan interface domain. | `Shipment`, `TabType` |

## 3. Aturan Coding

- **Arah ketergantungan searah:** `components` → `hooks`/`context` → `services` → backend.
  Komponen tidak boleh import `services`/API langsung.
- **Kontrak data hanya di `types.ts`.** Service mengembalikan type dari sini, bukan object mentah.
- **`services/` tanpa state dan tanpa logika UI.** Menerima input, memanggil backend, mengembalikan data.
- **`utils/` hanya fungsi pure.** Tidak boleh `console.log`, tidak boleh mutasi input, tidak boleh akses DOM/browser.
- **Literal berulang masuk `constants/`** sebelum dipakai di lebih dari satu file.
- **Credential backend tidak pernah di client.** WooCommerce consumer key/secret wajib lewat server proxy (baca `.env.example`).
- **Semua mapping Order → Shipment di satu tempat (`utils/orderMapping.ts`).** Component tidak pernah menurunkan Order.
- **Jangan menambah dependensi tanpa kebutuhan nyata** — stdlib/platform dulu. (banyak dependensi mati saat ini; lihat audit).
- Setiap placeholder berkomentar `ponytail:` menandai penyederhanaan yang disengaja.

## 4. Alur Data

### Saat ini (WooCommerce nyata)
```
HomeView ──► useOrders().pullOrders ──► OrderContext ──► orderRepository.pullOrders()
   │                                                     └─► WooCommerce GET orders?status=sudah-lunas
   ▼                                                        └─► Order[] ──► mapOrderToShipment ──► Shipment[]
OrderContext.shipments ──► App.props ──► HomeView / ShipmentsView
   │
ScannerView (scan/input manual label nomor order)
   │  scanPipeline.run(kode label, mis. "PO#68408")
   ▼
services/pipeline.ts
   │  matchingService.matchOrder ──► orderRepository.getAllOrders() (cache hasil pull; match by nomor order, digit-only)
   │  verificationService.verifyMatch
   │  syncService.sync            ──► updateOrderStatus (WooCommerce PUT status=sudah-dikirim) + saveHistory (placeholder)
   ▼
SyncResult  ──► ScannerView render kartu hasil (tanpa tahu layer backend)
```

### Target (setelah integrasi)
```
Component (render)
   │  panggil hook
   ▼
hooks (useShipments) ──► context (ShipmentContext, share ke view)
   │
   ▼
services (woocommerce / firebase / gemini)
   │
   ├─► WooCommerce REST API  (fetch order sudah-lunas, update status sudah-dikirim)
   ├─► Firebase Firestore     (simpan log scan, baca riwayat)
   └─► Gemini OCR              (fallback baca kode label dari foto)
```

Alur scan (flow koreksi, menggantikan PRD lama):
1. Tarik order berstatus `sudah-lunas` dari WooCommerce (belum punya resi).
2. Staf memindai barcode pada label paket → nomor order (mis. `PO#68408`).
3. Normalisasi digit-only (`PO#68408` → `68408`) → cocokkan ke daftar order.
4. Cocok → update status WooCommerce ke `sudah-dikirim` + simpan log + counter naik.
5. Tidak cocok → input manual nomor order.
6. Nomor resi DIISI LEWAT WEBSITE (admin), bukan app; status lalu jadi `completed` (di luar app).

## 5. Catatan Status Saat Ini

- `types.ts` **dipertahankan** di posisi semula: `Shipment` & `TabType` adalah inti domain
  (~15 baris). Memisahkannya ke banyak file hanya menambah churn tanpa manfaat —
  diperluas di file yang sama saat field backend (orderId, foto, timestamp) dibutuhkan.
- `components/` **tidak diubah** tampilan/desainnya. Satu-satunya perubahan behavior-netral:
  konstanta filter kategori dipindah ke `constants/shipments.ts`.
- `router/` sengaja kosong: navigasi tab saat ini sudah memadai; router baru dipakai
  saat deep-link atau navigasi Capacitor APK tiba.
- `OrderContext` sudah mengimplementasikan slot `context/` yang direncanakan: menyimpan
  data shipments hasil pull WooCommerce dan membaginya ke HomeView/ShipmentsView.
- `utils/orderMapping.ts` adalah satu-satunya tempat mapping Order → Shipment; UI
  (Home/Shipments/Scanner) hanya menerima `Shipment`. `mockData.ts` sudah dihapus.
  Status tampilan mengikuti alur toko: `sudah-lunas` → `Sudah Lunas`,
  `sudah-dikirim` → `Sudah Dikirim`, `completed` → `Completed` (fallback `Sudah Lunas`).
  Filter pill Shipments (`constants/shipments.ts`) = `All / Sudah Lunas / Sudah Dikirim / Completed`;
  setelah scan sukses `OrderContext` memindahkan shipment ke status `Sudah Dikirim`.
- Progress counter (PRD Req-1.3) hidup di `OrderContext` = single source of truth:
  `totalCount` (jumlah order `sudah-lunas` saat pull, reset tiap pull), `verifiedCount`
  (naik hanya saat `SyncResult.success`), plus turunan `progressPercent`/`isCompleted`
  dari `utils/progress.ts`. UI/Scanner/Pipeline tidak menghitung; ScannerView hanya
  memanggil `reportSyncResult()`.
- Kamera **on-demand**: tidak auto-start saat tab Scanner dibuka. Staf menekan tombol
  "Mulai Scan"; kegagalan kamera (izin ditolak, kamera tak ada) tampil di viewfinder
  lewat `useScanner.cameraError` (friendly mapping di `friendlyCameraError`).
- `ManualInputModal` = **fallback match**: ketik nomor order saat barcode gagal terbaca;
  `App` menjalankan `scanPipeline` yang sama seperti scan (match → PUT status
  `sudah-dikirim`). Bukan lagi pembuat paket lokal.
