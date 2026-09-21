"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowTopRightOnSquareIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Pagination from "@/components/Pagination";
import { useSearch } from "@/layout/SearchContext";
import { apiFetch } from "@/lib/api";
import { ENTITIES, entityLabel } from "@/lib/entities";
import type { LocationData } from "./LocationForm";

const ITEMS_PER_PAGE = 10;

const headers = [
  { label: "Lokasi", className: "" },
  { label: "Website", className: "hidden sm:table-cell" },
  { label: "Urutan", className: "hidden md:table-cell" },
  { label: "Status", className: "" },
  { label: "Aksi", className: "" },
];

const controlClass =
  "h-11 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90";
const labelClass = "mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400";

export default function LocationTable() {
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [entityFilter, setEntityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "active" | "inactive">("");
  const { searchTerm, setSearchTerm } = useSearch();

  const loadLocations = useCallback(async () => {
    try {
      const res = await apiFetch("/admin/locations");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLocations(Array.isArray(data) ? data : []);
      setError(null);
    } catch {
      setError("Gagal memuat data lokasi. Silakan muat ulang halaman.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, entityFilter, statusFilter]);

  const flash = (message: string) => {
    setNotice(message);
    setTimeout(() => setNotice(null), 3000);
  };

  // Aktif/nonaktif langsung dari tabel. Backend butuh data lengkap untuk PUT,
  // jadi baris yang sedang ditampilkan dikirim ulang dengan status dibalik.
  const toggleStatus = async (location: LocationData) => {
    setBusyId(location.id);
    try {
      const res = await apiFetch(`/locations/${location.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: location.entity,
          kota: location.kota,
          alamat: location.alamat,
          embedUrl: location.embedUrl,
          link: location.link || undefined,
          urutan: location.urutan,
          status: !location.status,
        }),
      });
      if (!res.ok) throw new Error();

      await loadLocations();
      flash(
        `${location.kota} ${location.status ? "dinonaktifkan" : "diaktifkan"}`
      );
    } catch {
      setError("Gagal mengubah status lokasi");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (location: LocationData) => {
    if (!confirm(`Hapus lokasi ${location.kota} (${entityLabel(location.entity)})?`)) {
      return;
    }

    setBusyId(location.id);
    try {
      const res = await apiFetch(`/locations/${location.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();

      await loadLocations();
      flash("Lokasi berhasil dihapus");
    } catch {
      setError("Gagal menghapus lokasi");
    } finally {
      setBusyId(null);
    }
  };

  const keyword = searchTerm.toLowerCase();
  const hasFilter = Boolean(searchTerm || entityFilter || statusFilter);

  const filtered = locations.filter((location) => {
    const matchesKeyword = [location.kota, location.alamat].some((field) =>
      (field || "").toLowerCase().includes(keyword)
    );
    if (!matchesKeyword) return false;
    if (entityFilter && location.entity !== entityFilter) return false;
    if (statusFilter === "active" && !location.status) return false;
    if (statusFilter === "inactive" && location.status) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const activeCount = locations.filter((l) => l.status).length;

  return (
    <div>
      <div className="mb-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 p-5 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Lokasi</p>
          <p className="mt-1 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {loading ? "..." : locations.length}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 p-5 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Tampil di Website</p>
          <p className="mt-1 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {loading ? "..." : activeCount}
          </p>
        </div>
      </div>

      <div className="mb-4 grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <label htmlFor="location-search" className={labelClass}>
            Cari
          </label>
          <input
            id="location-search"
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Kota atau alamat..."
            className={controlClass}
          />
        </div>
        <div>
          <label htmlFor="location-entity" className={labelClass}>
            Website
          </label>
          <select
            id="location-entity"
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className={controlClass}
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
          <label htmlFor="location-status" className={labelClass}>
            Status
          </label>
          <select
            id="location-status"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "" | "active" | "inactive")
            }
            className={controlClass}
          >
            <option value="">Semua status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>
        </div>
        <button
          type="button"
          disabled={!hasFilter}
          onClick={() => {
            setSearchTerm("");
            setEntityFilter("");
            setStatusFilter("");
          }}
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

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
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
            ) : paginated.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={headers.length}
                  className="px-4 py-10 text-center text-gray-500 dark:text-gray-400"
                >
                  {hasFilter
                    ? "Tidak ada lokasi yang cocok dengan filter ini."
                    : "Belum ada lokasi."}
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((location) => (
                <TableRow
                  key={location.id}
                  className="transition hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                >
                  <TableCell className="px-4 py-4">
                    <p className="font-medium text-gray-800 dark:text-white/90">
                      {location.kota}
                    </p>
                    <p className="mt-0.5 line-clamp-2 max-w-md text-xs text-gray-500 dark:text-gray-400">
                      {location.alamat}
                    </p>
                  </TableCell>

                  <TableCell className="hidden px-4 py-4 sm:table-cell">
                    <Badge color="blue">{entityLabel(location.entity)}</Badge>
                  </TableCell>

                  <TableCell className="hidden px-4 py-4 text-gray-600 md:table-cell dark:text-gray-400">
                    {location.urutan}
                  </TableCell>

                  <TableCell className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => toggleStatus(location)}
                      disabled={busyId === location.id}
                      title={location.status ? "Klik untuk menonaktifkan" : "Klik untuk mengaktifkan"}
                      className="disabled:opacity-40"
                    >
                      <Badge color={location.status ? "green" : "gray"}>
                        {location.status ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </button>
                  </TableCell>

                  <TableCell className="w-28 whitespace-nowrap px-4 py-4">
                    <div className="flex items-center gap-1">
                      {location.link && (
                        <a
                          href={location.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Buka di Google Maps"
                          className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10"
                        >
                          <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                        </a>
                      )}
                      <Link
                        href={`/locations/edit/${location.id}`}
                        title="Ubah lokasi"
                        className="rounded-lg p-2 text-gray-500 transition hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(location)}
                        disabled={busyId === location.id}
                        title="Hapus lokasi"
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
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filtered.length}
        itemsPerPage={ITEMS_PER_PAGE}
      />
    </div>
  );
}
