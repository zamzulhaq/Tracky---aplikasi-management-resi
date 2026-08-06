# 📄 Product Requirement Document (PRD)

## 📌 Document Overview

* **Project Name:** Tracky - Aplikasi Manajemen Resi Paket (ResiTracker)
* **Target Platform:** Mobile App (Android APK via React JS + Android Studio)
* **Tech Stack:** React JS (Frontend), Firebase (Firestore & Base64 / Storage), Gemini API (OCR Fallback), WooCommerce REST API (Backend Integration).
* **Document Version:** 1.1

---

## 1. Executive Summary & Problem Statement

### 1.1 Problem Statement

UMKM/Toko *online* sering mengalami kendala *human error* saat proses pengiriman paket. Staf sering lupa mengirim salah satu paket (misal: dari 10 paket, hanya 9 yang dikirim). Karena alur kerja lama tidak ada sistem *cross-check*, admin kesulitan mengetahui paket mana yang belum terkirim, sehingga data status pengiriman di toko WooCommerce menjadi berantakan.

### 1.2 Objective & Solution

Membuat aplikasi *mobile* sederhana, cepat, dan presisi untuk:

1. Menarik data paket berstatus **sudah-lunas** dari WooCommerce.
2. Memvalidasi setiap paket yang dikemas menggunakan **Barcode/QR Scanner** terhadap **label nomor order** (bukan nomor resi).
3. Menampilkan *real-time counter* (misal: 9/10) untuk mencegah adanya paket yang terlewat.
4. Mengubah status *order* di WooCommerce secara *real-time* menjadi **sudah-dikirim** sekaligus menyimpan *log* foto resi (Base64) di Firebase.

> **Koreksi flow (pengganti versi 1.0):** Nomor **resi DIISI MANUAL LEWAT WEBSITE** oleh admin *setelah* paket dikirim, bukan oleh aplikasi. Saat resi terisi, status order berubah menjadi **completed** (perilaku toko/plugin, di luar aplikasi). Aplikasi hanya memindahkan order dari `sudah-lunas` → `sudah-dikirim` berdasarkan **scan label nomor order**.

---

## 2. User Persona & Use Case

### Persona: Staf Packing / Admin Gudang

* **Goal:** Memastikan semua paket yang siap dikirim sudah terfoto dan status di WooCommerce ter-update otomatis tanpa ada yang kelewatan.
* **Flow Penggunaan:**
1. Buka aplikasi di HP (APK).
2. Klik tombol **"Mulai Scanning Sesi"** $\rightarrow$ Aplikasi menarik daftar paket berstatus `sudah-lunas` yang harus dikirim hari ini.
3. Mengarahkan kamera HP ke **barcode label** paket (berisi nomor order, mis. `PO#68408`).
4. Sistem membaca Barcode/QR.
5. Jika cocok dengan data WooCommerce, status WooCommerce berubah ke `sudah-dikirim` *real-time* & *counter* bertambah (misal `1/10` $\rightarrow$ `2/10`).
6. Jika barcode buram/tidak terbaca, staf menyunting **nomor order** secara manual.
7. Foto resi dan metadata tersimpan di menu **Riwayat**.
8. Admin kemudian mengisi **nomor resi** lewat website → status order otomatis `completed` (di luar aplikasi).



---

## 3. System Architecture & Tech Stack

```
[ Kamera HP (React JS) ] 
       │
       ├──> 1. Read Barcode / QR Code (ML Kit native via @capacitor-mlkit/barcode-scanning)
       └──> 2. Fallback OCR Teks (Gemini API)
       │
       ▼
[ Application Logic ] ──> Match Nomor Order (label paket)
       │
       ├──> Sync Update (Real-time) ──> [ WooCommerce REST API ] (Status: sudah-lunas -> sudah-dikirim)
       │
       └──> Save Data Log (Base64) ───> [ Firebase Firestore DB ]

```

> Nomor resi & status `completed` di-handle di website (admin) — di luar aplikasi.

---

## 4. Functional Requirements & Feature Specifications

### Module 1: Dashboard & Fetch Order

* **Req-1.1:** Aplikasi memiliki tombol *"Tarik Orderan Siap Kirim"*.
* **Req-1.2:** Sistem memanggil WooCommerce API endpoint `GET /wp-json/wc/v3/orders?status=sudah-lunas`.
* **Req-1.3:** Tampilan menunjukkan **Total Order Hari Ini** dan **Progress Counter** (misal: `0/12 Paket Verified`).

### Module 2: Camera & Auto-Recognition (QR / OCR)

* **Req-2.1 (Primary):** Menggunakan plugin kamera React untuk deteksi **Barcode / QR Code** label paket (nomor order) secara instan.
* **Req-2.2 (Fallback AI):** Jika tidak ada QR/Barcode, gambar dikirim ke **Gemini API** (`gemini-1.5-flash`) untuk membaca teks nomor order secara otomatis.
* **Req-2.3 (Manual Input Fallback):** Jika label gagal terbaca oleh QR/AI, sistem menampilkan *pop-up*: `"Nomor order tidak terdeteksi, silakan ketik manual"`. Data foto tetap diproses dan disimpan.

### Module 3: Matching & WooCommerce Sync

* **Req-3.1:** Sistem mencocokkan **Nomor Order** hasil *scan/manual* dengan daftar *order* WooCommerce (normalisasi digit-only, sehingga `PO#68408` = `68408`).
* **Req-3.2:** Jika **Cocok**:
* Kirim request update ke WooCommerce `PUT /wp-json/wc/v3/orders/<id>` dengan payload status `sudah-dikirim`.
* *Counter* bertambah secara *real-time* (misal dari `5/10` menjadi `6/10`).
* Tampilkan *feedback visual* hijau / getar pada HP.


* **Req-3.3:** Jika **Tidak Cocok / Tidak Ditemukan**:
* Tampilkan peringatan: `"Nomor Order Tidak Ada di List WooCommerce!"`.


* **Req-3.4 (di luar aplikasi):** Admin mengisi nomor resi lewat website; status order berubah ke `completed`.



### Module 4: Database & Log Riwayat (Firebase)

* **Req-4.1:** Foto hasil tangkapan diubah menjadi string format **Base64** (dengan kompresi *canvas* agar ukuran file kecil/ringan).
* **Req-4.2:** Simpan record ke Firebase Firestore dengan struktur data berikut:

```json
{
  "id": "doc_id_auto",
  "order_id": "68408",
  "nomor_order": "68408",
  "foto_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "timestamp": "2026-08-06 08:30:15",
  "status_sync_woocommerce": true,
  "input_mode": "AUTO_QR" // AUTO_QR, AI_GEMINI, atau MANUAL
}
```

> Nomor resi (`_custom_no_resi`) diisi admin lewat website setelah paket dikirim — bukan oleh aplikasi.

### Module 5: Menu Riwayat (History)

* **Req-5.1:** Menampilkan daftar foto resi yang sudah berhasil diproses dalam bentuk *card list* atau *grid*.
* **Req-5.2:** Menampilkan detail: **Thumbnail Foto Resi**, **Nomor Resi**, **Tanggal + Jam**, dan **Status Sync (Berhasil/Gagal)**.

---

## 5. Non-Functional Requirements & Build (Android APK)

* **Performance:** Kompresi foto Base64 tidak boleh melebihi $300\text{ KB}$ agar proses simpan ke Firebase dan *rendering* riwayat tetap responsif.
* **Build Android Studio (React JS to APK):**
1. Frontend dibangun menggunakan React JS (Vite / CRA).
2. Menggunakan **CapacitorJS** (`@capacitor/core` & `@capacitor/android`) untuk *wrap* proyek React JS ke folder native Android.
3. Buka folder `android/` di **Android Studio** $\rightarrow$ Build Signed APK / Debug APK untuk dipasang di HP.