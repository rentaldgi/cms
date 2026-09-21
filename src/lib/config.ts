const PRODUCTION_BACKEND = "https://backend.ptdahliaglobalindo.id";

const trim = (url: string) => url.replace(/\/+$/, "");

/**
 * URL backend untuk pemanggilan dari sisi server (route handler & komponen
 * server). Tidak ikut terkirim ke browser.
 *
 * Untuk testing lokal, buat .env.local berisi:
 *   BACKEND_URL=http://localhost:3333
 *   NEXT_PUBLIC_BACKEND_URL=http://localhost:3333
 */
export const BACKEND_URL = trim(process.env.BACKEND_URL || PRODUCTION_BACKEND);

/**
 * URL backend untuk hal yang dirakit di browser, yaitu alamat gambar.
 * Harus berawalan NEXT_PUBLIC_, kalau tidak nilainya kosong saat di browser
 * dan gambar akan diarahkan ke backend production.
 */
export const ASSET_BASE_URL = trim(
  process.env.NEXT_PUBLIC_BACKEND_URL || PRODUCTION_BACKEND
);

/** Nama cookie tempat token login disimpan (httpOnly, diset oleh route handler). */
export const TOKEN_COOKIE = "dgi_token";
