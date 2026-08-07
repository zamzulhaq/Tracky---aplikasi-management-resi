// Shared literals untuk shipment views.
// FILTER_CATEGORIES dipakai filter pills di ShipmentsView.
// Kategori = status bisnis alur toko (lihat mapOrderStatus di utils/orderMapping.ts).
// 'Sudah Dikirim'/'Completed' terisi dari pull API (VITE_WOO_FETCH_STATUSES).
// 'History' (Sprint 12) menampilkan Local History dari localStorage.
export const FILTER_CATEGORIES = ['All', 'Sudah Lunas', 'Sudah Dikirim', 'Completed', 'History'] as const;
