import { ASSET_BASE_URL, BACKEND_URL } from "@/lib/config";

/**
 * Semua permintaan ke backend lewat sini.
 *
 * Di browser, permintaan dikirim ke `/api/backend/...` supaya token login
 * (cookie httpOnly) ditempelkan oleh server Next, bukan oleh JavaScript.
 * Di server (komponen server), backend dipanggil langsung.
 */
export function apiUrl(path: string) {
  const clean = path.startsWith("/") ? path.slice(1) : path;

  return typeof window === "undefined"
    ? `${BACKEND_URL}/${clean}`
    : `/api/backend/${clean}`;
}

export function apiFetch(path: string, options: RequestInit = {}) {
  return fetch(apiUrl(path), { cache: "no-store", ...options });
}

/** URL file dari backend (thumbnail artikel, dll). */
export function assetUrl(path?: string | null) {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  return `${ASSET_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

export async function fetchArticleBySlug(slug: string) {
  const res = await apiFetch(`/article/${slug}`);

  if (!res.ok) {
    throw new Error("Artikel tidak ditemukan");
  }

  return res.json();
}
