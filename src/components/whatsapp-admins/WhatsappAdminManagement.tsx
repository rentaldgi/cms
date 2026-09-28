"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  MessageCircle,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Phone,
  Search,
  RefreshCw,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { ENTITIES, entityLabel } from "@/lib/entities";
import Badge from "@/components/ui/badge/Badge";

interface WhatsappAdmin {
  id: number;
  entity: string;
  name?: string | null;
  phoneNumber: string;
  createdAt?: string;
}

export default function WhatsappAdminManagement() {
  const [admins, setAdmins] = useState<WhatsappAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterEntity, setFilterEntity] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<WhatsappAdmin | null>(null);
  const [formData, setFormData] = useState({
    entity: "RENTAL_MOTOR",
    name: "",
    phoneNumber: "",
  });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Delete Confirm State
  const [deleteTarget, setDeleteTarget] = useState<WhatsappAdmin | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const url = filterEntity
        ? `/admin/whatsapp-admins?entity=${filterEntity}`
        : `/admin/whatsapp-admins`;
      const res = await apiFetch(url);
      if (!res.ok) throw new Error("Gagal mengambil data admin WhatsApp");
      const data = await res.json();
      setAdmins(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, [filterEntity]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const openAddModal = () => {
    setEditingAdmin(null);
    setFormData({
      entity: filterEntity || "RENTAL_MOTOR",
      name: "",
      phoneNumber: "",
    });
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (admin: WhatsappAdmin) => {
    setEditingAdmin(admin);
    setFormData({
      entity: admin.entity,
      name: admin.name || "",
      phoneNumber: admin.phoneNumber,
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.phoneNumber.trim()) {
      setFormError("Nomor WhatsApp harus diisi");
      return;
    }

    setSubmitting(true);
    try {
      const url = editingAdmin
        ? `/admin/whatsapp-admins/${editingAdmin.id}`
        : `/admin/whatsapp-admins`;
      const method = editingAdmin ? "PUT" : "POST";

      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal menyimpan admin WhatsApp");
      }

      setModalOpen(false);
      setToastMessage(editingAdmin ? "Admin WhatsApp berhasil diperbarui" : "Admin WhatsApp berhasil ditambahkan");
      setTimeout(() => setToastMessage(""), 4000);
      fetchAdmins();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      const res = await apiFetch(`/admin/whatsapp-admins/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Gagal menghapus admin");

      setDeleteTarget(null);
      setToastMessage("Admin WhatsApp berhasil dihapus");
      setTimeout(() => setToastMessage(""), 4000);
      fetchAdmins();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal menghapus admin");
    } finally {
      setDeleting(false);
    }
  };

  const filteredAdmins = admins.filter((admin) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      (admin.name && admin.name.toLowerCase().includes(q)) ||
      admin.phoneNumber.includes(q) ||
      entityLabel(admin.entity).toLowerCase().includes(q);
    return matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-lg animate-fade-in">
          <CheckCircle className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
            <MessageCircle className="w-6 h-6 text-emerald-500" />
            <span>Kelola Admin WhatsApp</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Daftar nomor WhatsApp admin untuk setiap website entitas Dahlia Group
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-xs hover:bg-brand-600 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Admin WA</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama admin, nomor telepon, atau brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-transparent pl-10 pr-4 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:text-white"
            />
          </div>

          {/* Filter Entity */}
          <div className="w-full sm:w-56">
            <select
              value={filterEntity}
              onChange={(e) => setFilterEntity(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Semua Website</option>
              {ENTITIES.map((ent) => (
                <option key={ent.value} value={ent.value}>
                  {ent.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden dark:border-gray-800 dark:bg-white/[0.03] shadow-xs">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-brand-500" />
            <span className="text-sm">Memuat daftar admin WhatsApp...</span>
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            <Phone className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="font-medium text-gray-700 dark:text-gray-300">Belum ada data admin WhatsApp</p>
            <p className="text-xs text-gray-400 mt-1">Klik tombol &ldquo;Tambah Admin WA&rdquo; untuk menambahkan nomor baru.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50/50 text-xs text-gray-500 uppercase tracking-wider dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
                <tr>
                  <th className="py-3 px-4">No</th>
                  <th className="py-3 px-4">Website / Brand</th>
                  <th className="py-3 px-4">Nama Admin</th>
                  <th className="py-3 px-4">Nomor WhatsApp</th>
                  <th className="py-3 px-4">Tes Hubungi</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredAdmins.map((admin, idx) => (
                  <tr key={admin.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                    <td className="py-3.5 px-4 text-gray-500 text-xs">{idx + 1}</td>
                    <td className="py-3.5 px-4 font-medium text-gray-800 dark:text-white">
                      <Badge color="gray">{entityLabel(admin.entity)}</Badge>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-900 dark:text-white">
                      {admin.name || <span className="text-gray-400 italic">Tanpa Nama</span>}
                    </td>
                    <td className="py-3.5 px-4 text-gray-700 dark:text-gray-300 font-mono text-xs">
                      +{admin.phoneNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <a
                        href={`https://wa.me/${admin.phoneNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Buka Chat</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(admin)}
                        className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-gray-800"
                        title="Edit Admin"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(admin)}
                        className="rounded p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-500/10"
                        title="Hapus Admin"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add / Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900 animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-500" />
                <span>{editingAdmin ? "Edit Admin WhatsApp" : "Tambah Admin WhatsApp"}</span>
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Website / Brand *
                </label>
                <select
                  value={formData.entity}
                  onChange={(e) => setFormData({ ...formData, entity: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  {ENTITIES.map((ent) => (
                    <option key={ent.value} value={ent.value}>
                      {ent.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Nama Admin (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Admin CS 1, Zahrah, dsb."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Nomor WhatsApp *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 08123456789 atau 628123456789"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
                <p className="mt-1 text-[11px] text-gray-400">Format 08... akan otomatis dikonversi menjadi 628...</p>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-brand-500 px-5 py-2 text-sm font-medium text-white shadow-xs hover:bg-brand-600 disabled:opacity-60"
                >
                  {submitting ? "Menyimpan..." : editingAdmin ? "Perbarui" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900 animate-fade-in text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400 mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Hapus Admin WhatsApp?
            </h3>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Apakah Anda yakin ingin menghapus nomor WhatsApp <strong>{deleteTarget.phoneNumber}</strong> (
              {deleteTarget.name || entityLabel(deleteTarget.entity)})?
            </p>

            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-xs hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
