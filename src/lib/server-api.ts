import { cookies } from "next/headers";
import { BACKEND_URL, TOKEN_COOKIE } from "@/lib/config";

/**
 * Pemanggilan backend dari komponen server.
 *
 * Komponen server tidak bisa lewat /api/backend (itu jalur untuk browser),
 * jadi token dibaca langsung dari cookie di sini.
 */
export async function serverFetch(path: string, options: RequestInit = {}) {
  const token = (await cookies()).get(TOKEN_COOKIE)?.value;
  const clean = path.startsWith("/") ? path : `/${path}`;

  return fetch(`${BACKEND_URL}${clean}`, {
    ...options,
    cache: "no-store",
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

/** Daftar artikel untuk CMS, termasuk draf. */
export async function fetchArticles() {
  try {
    const res = await serverFetch("/admin/article");

    if (!res.ok) {
      console.warn("Gagal mengambil artikel:", res.status);
      return [];
    }

    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;

    return [];
  } catch (err) {
    console.error("Backend tidak bisa dihubungi:", err);
    return [];
  }
}
