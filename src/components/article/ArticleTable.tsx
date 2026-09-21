"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Pagination from "../Pagination";
import Badge from "../ui/badge/Badge";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useSearch } from "@/layout/SearchContext";
import { apiFetch, assetUrl } from "@/lib/api";
import { ENTITIES, entityLabel } from "@/lib/entities";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

interface Article {
  id: number;
  entity: string;
  title: string;
  slug: string;
  /** Cuplikan isi dari backend; isi lengkap tidak ikut dikirim di daftar */
  excerpt: string;
  thumbnail: string;
  publishedAt: string;
  // Backend mengirim boolean, versi lama mengirim 0/1
  status: boolean | number;
  createdAt?: string;
  /** Jumlah pembaca, dari endpoint /admin/article */
  views?: number;
}

interface PageMeta {
  total: number;
  perPage: number;
  currentPage: number;
  lastPage: number;
}

type SortKey = "newest" | "most" | "least";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Terbaru" },
  { value: "most", label: "Paling banyak dibaca" },
  { value: "least", label: "Paling sedikit dibaca" },
];

const ITEMS_PER_PAGE = 10;

const headers = [
  { label: "Artikel", className: "" },
  { label: "Website", className: "hidden sm:table-cell" },
  { label: "Tanggal", className: "hidden lg:table-cell" },
  { label: "Dilihat", className: "hidden md:table-cell" },
  { label: "Status", className: "" },
  { label: "Aksi", className: "" },
];

export default function ArticleTable() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [summary, setSummary] = useState({ totalArticles: 0, totalViews: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortKey>("newest");
  const [entityFilter, setEntityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "published" | "draft">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const { searchTerm, setSearchTerm } = useSearch();
  const debouncedSearch = useDebouncedValue(searchTerm.trim());

  const requestId = useRef(0);

  const loadArticles = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);

    const params = new URLSearchParams({
      page: String(currentPage),
      limit: String(ITEMS_PER_PAGE),
      sort: sortBy,
    });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (entityFilter) params.set("entity", entityFilter);
    if (statusFilter) params.set("status", statusFilter);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);

    try {
      const res = await apiFetch(`/admin/article?${params}`);
      if (!res.ok) throw new Error("Gagal mengambil data artikel");

      const data = await res.json();
      if (id !== requestId.current) return;

      setArticles(data.data ?? []);
      setMeta(data.meta ?? null);
      if (data.summary) setSummary(data.summary);
      setError(null);
    } catch (err) {
      if (id !== requestId.current) return;
      console.error(err);
      setError("Gagal memuat data artikel. Silakan muat ulang halaman.");
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [currentPage, sortBy, debouncedSearch, entityFilter, statusFilter, dateFrom, dateTo]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  // Filter berubah → kembali ke halaman 1
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, sortBy, entityFilter, statusFilter, dateFrom, dateTo]);

  const handleDelete = async (article: Article) => {
    if (!confirm(`Hapus artikel "${article.title}"?`)) return;

    setDeletingId(article.id);
    try {
      const res = await apiFetch(`/admin/article/${article.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Gagal menghapus artikel");
      }

      // Artikel terakhir di halaman ini dihapus → mundur satu halaman
      if (articles.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        await loadArticles();
      }
      setNotice("Artikel berhasil dihapus");
      setTimeout(() => setNotice(null), 3000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (value: string) =>
    value
      ? new Date(value).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "-";

  const isPublished = (status: boolean | number) =>
    status === true || status === 1;

  const hasFilter = Boolean(
    searchTerm || entityFilter || statusFilter || dateFrom || dateTo
  );

  const resetFilters = () => {
    setSearchTerm("");
    setEntityFilter("");
    setStatusFilter("");
    setDateFrom("");
    setDateTo("");
  };

  return (
    <div>
      <div className="mb-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 p-5 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Dilihat</p>
          <p className="mt-1 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {meta ? summary.totalViews.toLocaleString("id-ID") : "..."}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 p-5 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Artikel</p>
          <p className="mt-1 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {meta ? summary.totalArticles.toLocaleString("id-ID") : "..."}
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="filter-search" className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
            Cari
          </label>
          <input
            id="filter-search"
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari judul atau isi artikel..."
            className="h-11 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90"
          />
        </div>
        <div>
          <label htmlFor="filter-sort" className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
            Urutkan
          </label>
          <select
            id="filter-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="h-11 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-700 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-4 grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <label htmlFor="filter-entity" className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
            Website
          </label>
          <select
            id="filter-entity"
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="h-11 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-700 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90"
          >
            <option value="">Semua website</option>
            {ENTITIES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filter-status" className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
            Status
          </label>
          <select
            id="filter-status"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "" | "published" | "draft")
            }
            className="h-11 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-700 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90"
          >
            <option value="">Semua status</option>
            <option value="published">Terbit</option>
            <option value="draft">Draf</option>
          </select>
        </div>
        <div>
          <label htmlFor="filter-date-from" className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
            Tanggal mulai
          </label>
          <input
            id="filter-date-from"
            type="date"
            value={dateFrom}
            max={dateTo || undefined}
            onChange={(e) => setDateFrom(e.target.value)}
            className="h-11 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-700 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90"
          />
        </div>
        <div>
          <label htmlFor="filter-date-to" className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
            Tanggal akhir
          </label>
          <input
            id="filter-date-to"
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => setDateTo(e.target.value)}
            className="h-11 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-700 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90"
          />
        </div>
        <button
          type="button"
          onClick={resetFilters}
          disabled={!hasFilter}
          className="h-11 rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
        >
          Reset filter
        </button>
      </div>

      {notice && (
        <p className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-500/10 dark:text-green-400">
          {notice}
        </p>
      )}

      <div className="w-full overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
        <Table className="w-full min-w-[520px] text-sm">
          <TableHeader className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03]">
            <TableRow>
              {headers.map((header) => (
                <TableCell
                  key={header.label}
                  className={`px-4 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 ${header.className}`}
                >
                  {header.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody
            className={`divide-y divide-gray-100 transition-opacity dark:divide-gray-800 ${
              loading && articles.length > 0 ? "opacity-50" : ""
            }`}
          >
            {loading && articles.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={headers.length}
                  className="px-4 py-10 text-center text-gray-500 dark:text-gray-400"
                >
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={headers.length}
                  className="px-4 py-10 text-center text-red-600 dark:text-red-400"
                >
                  {error}
                </TableCell>
              </TableRow>
            ) : articles.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={headers.length}
                  className="px-4 py-10 text-center text-gray-500 dark:text-gray-400"
                >
                  {hasFilter
                    ? "Tidak ada artikel yang cocok dengan filter ini."
                    : "Belum ada artikel."}
                </TableCell>
              </TableRow>
            ) : (
              articles.map((article) => (
                <TableRow
                  key={article.id}
                  className="transition hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                >
                  <TableCell className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="hidden h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:block dark:bg-white/10">
                        {article.thumbnail?.trim() ? (
                          <Image
                            src={assetUrl(article.thumbnail)}
                            alt={article.title}
                            width={64}
                            height={48}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">
                            Tanpa foto
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="line-clamp-2 font-medium text-gray-800 dark:text-white/90">
                          {article.title}
                        </p>
                        <p className="mt-0.5 hidden max-w-xs truncate text-xs text-gray-500 lg:block dark:text-gray-400">
                          {article.excerpt}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="hidden px-4 py-4 sm:table-cell">
                    <Badge color="blue">{entityLabel(article.entity)}</Badge>
                  </TableCell>

                  <TableCell className="hidden whitespace-nowrap px-4 py-4 text-gray-600 lg:table-cell dark:text-gray-400">
                    {formatDate(article.publishedAt)}
                  </TableCell>

                  <TableCell className="hidden whitespace-nowrap px-4 py-4 text-gray-700 md:table-cell dark:text-gray-300">
                    {(article.views ?? 0).toLocaleString("id-ID")}
                  </TableCell>

                  <TableCell className="px-4 py-4">
                    <Badge color={isPublished(article.status) ? "green" : "amber"}>
                      {isPublished(article.status) ? "Terbit" : "Draf"}
                    </Badge>
                  </TableCell>

                  <TableCell className="w-20 whitespace-nowrap px-4 py-4">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/article/edit/${article.slug}`}
                        title="Ubah artikel"
                        className="rounded-lg p-2 text-gray-500 transition hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(article)}
                        disabled={deletingId === article.id}
                        title="Hapus artikel"
                        className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40 dark:hover:bg-red-500/10"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={meta?.lastPage ?? 0}
        onPageChange={setCurrentPage}
        totalItems={meta?.total ?? 0}
        itemsPerPage={ITEMS_PER_PAGE}
      />
    </div>
  );
}
