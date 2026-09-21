"use client";

import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Jumlah data yang sedang disaring, untuk keterangan "Menampilkan x–y dari z" */
  totalItems?: number;
  itemsPerPage?: number;
}

/**
 * Menampilkan maksimal 5 nomor halaman di sekitar halaman aktif, sisanya
 * diringkas jadi "…". Tanpa ini, 40 artikel berarti 8 tombol berjejer, dan
 * 200 artikel membuat barisnya meluber keluar layar.
 */
function pageNumbers(current: number, total: number): (number | "gap")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "gap")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) pages.push("gap");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("gap");

  pages.push(total);
  return pages;
}

const baseButton =
  "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm transition disabled:cursor-not-allowed disabled:opacity-40";
const idleButton =
  "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/10";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const from =
    totalItems && itemsPerPage ? (currentPage - 1) * itemsPerPage + 1 : null;
  const to =
    totalItems && itemsPerPage
      ? Math.min(currentPage * itemsPerPage, totalItems)
      : null;

  return (
    <div className="mt-5 flex flex-col items-center justify-between gap-3 sm:flex-row">
      {from !== null && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Menampilkan {from}–{to} dari {totalItems} data
        </p>
      )}

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className={`${baseButton} ${idleButton}`}
          aria-label="Halaman sebelumnya"
        >
          ‹
        </button>

        {pageNumbers(currentPage, totalPages).map((page, i) =>
          page === "gap" ? (
            <span
              key={`gap-${i}`}
              className="px-1 text-sm text-gray-400 dark:text-gray-600"
            >
              …
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              aria-current={page === currentPage ? "page" : undefined}
              className={`${baseButton} ${
                page === currentPage
                  ? "border-brand-500 bg-brand-500 font-medium text-white"
                  : idleButton
              }`}
            >
              {page}
            </button>
          )
        )}

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className={`${baseButton} ${idleButton}`}
          aria-label="Halaman berikutnya"
        >
          ›
        </button>
      </div>
    </div>
  );
}
