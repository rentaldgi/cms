"use client";

import ArticleTable from "@/components/article/ArticleTable";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ArticleContent() {
  const searchParams = useSearchParams();
  const [successMessage, setSuccessMessage] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const message = searchParams.get("success");
    if (!message) return;

    setSuccessMessage(message);
    setVisible(true);

    // Hapus ?success= dari URL supaya tidak muncul lagi saat halaman dimuat ulang
    const url = new URL(window.location.href);
    url.searchParams.delete("success");
    window.history.replaceState({}, "", url.toString());

    const hide = setTimeout(() => setVisible(false), 3000);
    const clear = setTimeout(() => setSuccessMessage(""), 4000);

    return () => {
      clearTimeout(hide);
      clearTimeout(clear);
    };
  }, [searchParams]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Artikel
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Kelola artikel untuk ketiga website
          </p>
        </div>

        <Link
          href="/article/create"
          className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600"
        >
          + Tambah Artikel
        </Link>
      </div>

      {successMessage && (
        <div
          className={`rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 transition-all duration-500 dark:bg-green-500/10 dark:text-green-400 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        >
          {successMessage}
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <ArticleTable />
      </div>
    </div>
  );
}
