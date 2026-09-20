/**
 * URL backend. Untuk testing lokal, buat file .env.local berisi:
 *   BACKEND_URL=http://localhost:3333
 * Tanpa env, otomatis memakai backend production.
 */
export const BACKEND_URL = (
  process.env.BACKEND_URL || "https://backend.ptdahliaglobalindo.id"
).replace(/\/+$/, "");

/** Nama cookie tempat token login disimpan (httpOnly, diset oleh route handler). */
export const TOKEN_COOKIE = "dgi_token";
