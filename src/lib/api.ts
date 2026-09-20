import { BACKEND_URL } from "@/lib/config";

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
  return `${BACKEND_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

export async function fetchArticles() {
  const res = await apiFetch("/article");

  if (!res.ok) {
    console.warn("Gagal mengambil artikel:", res.status);
    return [];
  }

  const data = await res.json();

  // Endpoint mengembalikan array langsung; bentuk { data: [...] } ikut ditangani
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;

  console.warn("Bentuk data artikel tidak dikenali:", data);
  return [];
}

export async function fetchArticleBySlug(slug: string) {
  const res = await apiFetch(`/article/${slug}`);

  if (!res.ok) {
    throw new Error("Artikel tidak ditemukan");
  }

  return res.json();
}
