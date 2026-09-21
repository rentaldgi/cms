import { serverFetch } from "@/lib/server-api";

export interface DashboardSummary {
  totalArticles: number;
  published: number;
  draft: number;
  perEntity: Record<string, number>;
  latest: {
    id: number;
    title: string;
    slug: string;
    entity: string;
    thumbnail?: string;
    publishedAt?: string;
    createdAt?: string;
  }[];
}

const EMPTY: DashboardSummary = {
  totalArticles: 0,
  published: 0,
  draft: 0,
  perEntity: {},
  latest: [],
};

/**
 * Angka dashboard langsung dihitung backend (/admin/article/summary), jadi
 * dashboard tidak perlu mengunduh semua artikel beserta isinya.
 */
export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  try {
    const res = await serverFetch("/admin/article/summary");
    if (!res.ok) {
      console.warn("Gagal mengambil ringkasan dashboard:", res.status);
      return EMPTY;
    }
    return { ...EMPTY, ...(await res.json()) };
  } catch (err) {
    console.error("Backend tidak bisa dihubungi:", err);
    return EMPTY;
  }
}
