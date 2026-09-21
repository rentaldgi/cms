"use client";

import { Suspense } from "react";
import Link from "next/link";
import FlashMessage from "@/components/common/FlashMessage";
import LocationTable from "@/components/location/LocationTable";

export default function LocationsPage() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Lokasi
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Cabang yang tampil di halaman Kontak tiap website
          </p>
        </div>

        <Link
          href="/locations/create"
          className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600"
        >
          + Tambah Lokasi
        </Link>
      </div>

      <Suspense>
        <FlashMessage />
      </Suspense>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <LocationTable />
      </div>
    </div>
  );
}
