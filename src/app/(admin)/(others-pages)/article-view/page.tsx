"use client";

import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";
interface ArticleView {
  article_id: number;
  title: string;
  entity: "RENTAL_MOTOR" | "RENTAL_IPHONE" | "SEWA_APARTMENT";
  total_views: number;
}

export default function ArticleViewPage() {
  const [views, setViews] = useState<ArticleView[]>([]);
  const [entity, setEntity] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchViews = async (entityFilter = "") => {
    setLoading(true);
    try {
      let url = "/article-views";
      if (entityFilter) {
        url += `?entity=${entityFilter}`;
      }

      const res = await apiFetch(url);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data: ArticleView[] = await res.json();
      setViews(data);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
      setViews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViews(entity);
  }, [entity]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Analytics Artikel</h1>

      {/* Filter */}
      <div className="mb-4">
        <label className="mr-2">Filter Entity:</label>
        <select
          value={entity}
          onChange={(e) => setEntity(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Semua</option>
          <option value="RENTAL_MOTOR">Rental Motor</option>
          <option value="RENTAL_IPHONE">Rental iPhone</option>
          <option value="SEWA_APARTMENT">Sewa Apartment</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">#</th>
              <th className="border px-4 py-2">Judul Artikel</th>
              <th className="border px-4 py-2">Entity</th>
              <th className="border px-4 py-2">Total Views</th>
            </tr>
          </thead>
          <tbody>
            {views.length > 0 ? (
              views.map((item, index) => (
                <tr key={item.article_id}>
                  <td className="border px-4 py-2">{index + 1}</td>
                  <td className="border px-4 py-2">{item.title}</td>
                  <td className="border px-4 py-2">{item.entity}</td>
                  <td className="border px-4 py-2">{item.total_views}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="text-center border px-4 py-2 text-gray-500"
                >
                  Tidak ada data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
