"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit3, Check, X, FileText, Printer, Trash } from "lucide-react";
import { brandName, brandDomain } from "@/lib/entities";

export interface MaintenanceItem {
  id: string;
  no: number;
  keterangan: string;
  website: string;
}

interface Props {
  report: {
    period: {
      year: number;
      month: number;
      monthName: string;
      label: string;
    };
    adminBreakdown: Array<{
      adminId: number;
      name: string;
      phoneNumber: string;
      entity: string;
      entityLabel: string;
      brandName?: string;
      totalClicks: number;
    }>;
    entityBreakdown: Array<{
      entity: string;
      entityLabel: string;
      brandName?: string;
      brandDomain?: string;
      websiteViews: number;
      whatsappClicks: number;
      articleViews: number;
    }>;
    allArticles?: Array<{
      id: number;
      title: string;
      slug: string;
      entity: string;
      entityLabel: string;
      brandName?: string;
      publishedAt: string | null;
      publishedAtFormatted: string;
      viewsInMonth: number;
    }>;
    topArticles: Array<{
      id: number;
      title: string;
      slug: string;
      entity: string;
      entityLabel: string;
      brandName?: string;
      publishedAt?: string | null;
      publishedAtFormatted?: string;
      viewsInMonth: number;
    }>;
  };
}

export default function OfficialReportPrintView({ report }: Props) {
  const storageKey = `dgi_maintenance_${report.period.year}_${report.period.month}`;

  const [maintenanceList, setMaintenanceList] = useState<MaintenanceItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editKeterangan, setEditKeterangan] = useState("");
  const [editWebsite, setEditWebsite] = useState("Pixelnesia");

  const [newKeterangan, setNewKeterangan] = useState("");
  const [newWebsite, setNewWebsite] = useState("Pixelnesia");
  const [isAdding, setIsAdding] = useState(false);

  // Load maintenance items from localStorage for this specific month/year
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setMaintenanceList(JSON.parse(saved));
      } else {
        setMaintenanceList([]);
      }
    } catch {
      setMaintenanceList([]);
    }
  }, [storageKey]);

  // Save to localStorage whenever list changes
  const saveList = (newList: MaintenanceItem[]) => {
    setMaintenanceList(newList);
    try {
      localStorage.setItem(storageKey, JSON.stringify(newList));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddMaintenance = () => {
    if (!newKeterangan.trim()) return;
    const item: MaintenanceItem = {
      id: Date.now().toString(),
      no: maintenanceList.length + 1,
      keterangan: newKeterangan.trim(),
      website: newWebsite,
    };
    saveList([...maintenanceList, item]);
    setNewKeterangan("");
    setIsAdding(false);
  };

  const startEdit = (item: MaintenanceItem) => {
    setEditingId(item.id);
    setEditKeterangan(item.keterangan);
    setEditWebsite(item.website);
  };

  const handleSaveEdit = (id: string) => {
    if (!editKeterangan.trim()) return;
    const updated = maintenanceList.map((item) =>
      item.id === id ? { ...item, keterangan: editKeterangan.trim(), website: editWebsite } : item
    );
    saveList(updated);
    setEditingId(null);
  };

  const handleDeleteMaintenance = (id: string) => {
    const filtered = maintenanceList
      .filter((item) => item.id !== id)
      .map((item, idx) => ({ ...item, no: idx + 1 }));
    saveList(filtered);
  };

  const handleClearAll = () => {
    if (maintenanceList.length === 0) return;
    if (confirm("Kosongkan semua catatan maintenance untuk bulan ini?")) {
      saveList([]);
    }
  };

  const printDocumentTitle = `Laporan Pengelolaan Website Dahlia Group Bulan ${report.period.monthName} ${report.period.year}`;

  // Automatically update page title when printing (via shortcut Ctrl+P or button)
  useEffect(() => {
    const handleBeforePrint = () => {
      document.title = printDocumentTitle;
    };
    window.addEventListener("beforeprint", handleBeforePrint);
    return () => {
      window.removeEventListener("beforeprint", handleBeforePrint);
    };
  }, [printDocumentTitle]);

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = printDocumentTitle;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 2000);
  };

  /* -------------------------------------------------------------------------- */
  /* Grouping Section 2: WhatsApp Admins by Website                             */
  /* -------------------------------------------------------------------------- */
  const whatsappByEntity: Record<
    string,
    Array<{ adminId: number; name: string; phoneNumber: string; totalClicks: number }>
  > = {};

  report.adminBreakdown.forEach((admin) => {
    const brand = admin.brandName || brandName(admin.entity);
    if (!whatsappByEntity[brand]) {
      whatsappByEntity[brand] = [];
    }
    whatsappByEntity[brand].push(admin);
  });

  /* -------------------------------------------------------------------------- */
  /* Grouping Section 4: Articles by Release Date (Waktu)                       */
  /* -------------------------------------------------------------------------- */
  const articles = report.allArticles || report.topArticles || [];

  // Group by published date
  const articlesByDate: Record<
    string,
    Array<{
      id: number;
      title: string;
      brandName: string;
      viewsInMonth: number;
    }>
  > = {};

  articles.forEach((art) => {
    const dateKey = art.publishedAtFormatted || art.publishedAt || "Lainnya";
    if (!articlesByDate[dateKey]) {
      articlesByDate[dateKey] = [];
    }
    articlesByDate[dateKey].push({
      id: art.id,
      title: art.title,
      brandName: art.brandName || brandName(art.entity),
      viewsInMonth: art.viewsInMonth,
    });
  });

  const dateKeys = Object.keys(articlesByDate);

  return (
    <div className="space-y-6">
      {/* Maintenance Input Manager & Print Controls (Visible on screen, hidden on print) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] print:hidden shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-500" />
              <span>1. Input Catatan Maintenance ({report.period.label})</span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Input data maintenance di bawah ini. Data otomatis tersimpan dan dicetak pada dokumen PDF.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {maintenanceList.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-gray-700 dark:bg-gray-800 dark:text-red-400 transition"
                title="Kosongkan catatan bulan ini"
              >
                <Trash className="w-3.5 h-3.5" />
                <span>Kosongkan</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-600 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Baris Maintenance</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
          </div>
        </div>

        {/* Input Form Modal / Inline Add */}
        {isAdding && (
          <div className="mb-4 p-4 rounded-xl border border-brand-200 bg-brand-50/50 dark:border-brand-900/50 dark:bg-brand-950/20">
            <h3 className="text-xs font-bold text-brand-900 dark:text-brand-300 mb-2">
              Tambah Catatan Maintenance Baru:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Keterangan Pekerjaan Maintenance *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Update alamat cabang malang, surabaya, dan bekasi"
                  value={newKeterangan}
                  onChange={(e) => setNewKeterangan(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Website / Brand Terkait *
                </label>
                <select
                  value={newWebsite}
                  onChange={(e) => setNewWebsite(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="Pixelnesia">Pixelnesia</option>
                  <option value="Rentalday">Rentalday</option>
                  <option value="Perfectroom">Perfectroom</option>
                  <option value="Pindah Loka">Pindah Loka</option>
                  <option value="Semua Website">Semua Website</option>
                </select>
              </div>
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleAddMaintenance}
                className="rounded-lg bg-brand-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-600"
              >
                Simpan Catatan
              </button>
            </div>
          </div>
        )}

        {/* Maintenance Items Table List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400">
              <tr>
                <th className="py-2.5 px-3 w-12 text-center">No.</th>
                <th className="py-2.5 px-3">Keterangan</th>
                <th className="py-2.5 px-3 w-40 text-center">Website</th>
                <th className="py-2.5 px-3 w-28 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {maintenanceList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-400">
                    Belum ada catatan maintenance untuk bulan {report.period.label}. Klik &quot;Tambah Baris Maintenance&quot; untuk menginput data.
                  </td>
                </tr>
              ) : (
                maintenanceList.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                    {editingId === item.id ? (
                      <>
                        <td className="py-2.5 px-3 text-center text-gray-500">{item.no}.</td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={editKeterangan}
                            onChange={(e) => setEditKeterangan(e.target.value)}
                            className="w-full rounded border border-brand-500 bg-white px-2.5 py-1 text-xs text-gray-900 focus:outline-none dark:bg-gray-800 dark:text-white"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <select
                            value={editWebsite}
                            onChange={(e) => setEditWebsite(e.target.value)}
                            className="w-full rounded border border-brand-500 bg-white px-2 py-1 text-xs text-gray-900 focus:outline-none dark:bg-gray-800 dark:text-white"
                          >
                            <option value="Pixelnesia">Pixelnesia</option>
                            <option value="Rentalday">Rentalday</option>
                            <option value="Perfectroom">Perfectroom</option>
                            <option value="Pindah Loka">Pindah Loka</option>
                            <option value="Semua Website">Semua Website</option>
                          </select>
                        </td>
                        <td className="py-2 px-3 text-right space-x-1">
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(item.id)}
                            className="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded"
                            title="Simpan perubahan"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                            title="Batal"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-2.5 px-3 text-center text-gray-500 font-medium">{item.no}.</td>
                        <td className="py-2.5 px-3 font-medium text-gray-800 dark:text-gray-200">
                          {item.keterangan}
                        </td>
                        <td className="py-2.5 px-3 text-center text-gray-700 dark:text-gray-300 font-medium">
                          {item.website}
                        </td>
                        <td className="py-2.5 px-3 text-right space-x-1">
                          <button
                            type="button"
                            onClick={() => startEdit(item)}
                            className="p-1 text-gray-400 hover:text-brand-500 rounded"
                            title="Edit baris"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteMaintenance(item.id)}
                            className="p-1 text-gray-400 hover:text-red-500 rounded"
                            title="Hapus baris"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* OFFICIAL PRINTABLE PDF DOCUMENT TEMPLATE (Exact 1:1 Layout)           */}
      {/* ====================================================================== */}
      <div className="official-report-sheet max-w-4xl mx-auto bg-white p-8 sm:p-14 text-black shadow-xl rounded-xl border border-gray-200 dark:border-gray-700 print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none">
        {/* Document Header */}
        <div className="text-center pb-3 mb-6 border-b border-black">
          <h1 className="text-base sm:text-lg font-bold tracking-wider uppercase font-sans text-black">
            DAHLIA GROUP
          </h1>
          <h2 className="text-sm sm:text-base font-bold tracking-wider uppercase font-sans mt-1 text-black">
            LAPORAN PENGELOLAAN WEBSITE DAHLIA GROUP BULAN {report.period.monthName.toUpperCase()}{" "}
            {report.period.year}
          </h2>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* 1. Maintenance                                                     */}
        {/* ------------------------------------------------------------------ */}
        <div className="report-section mb-8">
          <h3 className="text-sm font-bold text-black mb-3.5 font-sans">1. Maintenance</h3>
          <table className="w-full border-collapse border border-black text-xs sm:text-sm font-sans">
            <thead>
              <tr className="border-b border-black font-bold">
                <th className="border-r border-black p-2.5 w-14 text-center">No.</th>
                <th className="border-r border-black p-2.5 text-center">Keterangan</th>
                <th className="p-2.5 w-44 sm:w-56 text-center">Website</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceList.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-3 text-center italic text-gray-500">
                    Tidak ada catatan maintenance pada bulan ini
                  </td>
                </tr>
              ) : (
                maintenanceList.map((item) => (
                  <tr key={item.id} className="border-b border-black">
                    <td className="border-r border-black p-2.5 text-center align-top">{item.no}.</td>
                    <td className="border-r border-black p-2.5 align-top leading-relaxed text-black">
                      {item.keterangan}
                    </td>
                    <td className="p-2.5 align-top text-center text-black font-normal">{item.website}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* 2. Traffic Tombol WhatsApp                                         */}
        {/* ------------------------------------------------------------------ */}
        <div className="report-section mb-8">
          <h3 className="text-sm font-bold text-black mb-3.5 font-sans">
            2. Traffic Tombol WhatsApp
          </h3>
          <table className="w-full border-collapse border border-black text-xs sm:text-sm font-sans">
            <thead>
              <tr className="border-b border-black font-bold">
                <th className="border-r border-black p-2.5 w-14 text-center">No</th>
                <th className="border-r border-black p-2.5 w-36 sm:w-44 text-center">Website</th>
                <th className="border-r border-black p-2.5 text-center">Admin</th>
                <th className="p-2.5 w-28 sm:w-32 text-center">Jumlah Klik</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(whatsappByEntity).length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-3 text-center italic text-gray-500">
                    Belum ada data klik WhatsApp pada bulan ini
                  </td>
                </tr>
              ) : (
                Object.entries(whatsappByEntity).map(([brandTitle, adminList], brandIdx) => (
                  <React.Fragment key={brandTitle}>
                    {adminList.map((admin, adminIdx) => (
                      <tr key={`${admin.adminId}-${adminIdx}`} className="border-b border-black">
                        {adminIdx === 0 && (
                          <>
                            <td
                              rowSpan={adminList.length}
                              className="border-r border-black p-2.5 text-center align-middle"
                            >
                              {brandIdx + 1}.
                            </td>
                            <td
                              rowSpan={adminList.length}
                              className="border-r border-black p-2.5 text-center align-middle font-normal"
                            >
                              {brandTitle}
                            </td>
                          </>
                        )}
                        <td className="border-r border-black p-2.5 text-center leading-relaxed text-black">
                          {admin.name} ({admin.phoneNumber})
                        </td>
                        <td className="p-2.5 text-center font-normal text-black">{admin.totalClicks}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* 3. Traffic Pengunjung Website                                      */}
        {/* ------------------------------------------------------------------ */}
        <div className="report-section mb-8">
          <h3 className="text-sm font-bold text-black mb-3.5 font-sans">
            3. Traffic Pengunjung Website
          </h3>
          <table className="w-full border-collapse border border-black text-xs sm:text-sm font-sans">
            <thead>
              <tr className="border-b border-black font-bold">
                <th className="border-r border-black p-2.5 text-center">Website</th>
                <th className="p-2.5 w-44 sm:w-56 text-center">Banyak Pengunjung</th>
              </tr>
            </thead>
            <tbody>
              {report.entityBreakdown.map((row) => {
                const domain = row.brandDomain || brandDomain(row.entity);

                return (
                  <tr key={row.entity} className="border-b border-black">
                    <td className="border-r border-black p-2.5 text-center font-normal text-black">
                      {domain}
                    </td>
                    <td className="p-2.5 text-center font-normal text-black">{row.websiteViews}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* 4. Traffic Artikel                                                 */}
        {/* ------------------------------------------------------------------ */}
        <div className="report-section mb-4">
          <h3 className="text-sm font-bold text-black mb-3.5 font-sans">4. Traffic Artikel</h3>
          <table className="w-full border-collapse border border-black text-xs sm:text-sm font-sans">
            <thead>
              <tr className="border-b border-black font-bold">
                <th className="border-r border-black p-2.5 w-12 text-center">No.</th>
                <th className="border-r border-black p-2.5 w-32 sm:w-36 text-center">Waktu</th>
                <th className="border-r border-black p-2.5 w-28 sm:w-32 text-center">Keterangan</th>
                <th className="border-r border-black p-2.5 text-center">Judul</th>
                <th className="p-2.5 w-24 sm:w-28 text-center">Jumlah Klik</th>
              </tr>
            </thead>
            <tbody>
              {dateKeys.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center italic text-gray-500">
                    Tidak ada artikel yang diterbitkan pada bulan ini.
                  </td>
                </tr>
              ) : (
                dateKeys.map((dateStr, dateIdx) => {
                  const itemsOnDate = articlesByDate[dateStr];
                  return (
                    <React.Fragment key={dateStr}>
                      {itemsOnDate.map((art, artIdx) => (
                        <tr key={art.id} className="border-b border-black">
                          {artIdx === 0 && (
                            <>
                              <td
                                rowSpan={itemsOnDate.length}
                                className="border-r border-black p-2.5 text-center align-middle"
                              >
                                {dateIdx + 1}.
                              </td>
                              <td
                                rowSpan={itemsOnDate.length}
                                className="border-r border-black p-2.5 text-center align-middle font-normal"
                              >
                                {dateStr}
                              </td>
                            </>
                          )}
                          <td className="border-r border-black p-2.5 text-center align-middle font-normal text-black">
                            {art.brandName}
                          </td>
                          <td className="border-r border-black p-2.5 align-middle leading-relaxed text-black">
                            {art.title}
                          </td>
                          <td className="p-2.5 text-center align-middle font-normal text-black">
                            {art.viewsInMonth}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print CSS Rules for Exact A4 Pagination */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 1.5cm 1.5cm 1.5cm 1.5cm;
          }
          body, html {
            background-color: #ffffff !important;
            color: #000000 !important;
            font-family: Arial, Helvetica, sans-serif !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          /* Hide sidebar, navbar header, buttons, and CMS chrome elements */
          header,
          aside,
          nav,
          [role="banner"],
          [role="navigation"],
          .print\\:hidden {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          .official-report-sheet {
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            color: #000000 !important;
          }
          .official-report-sheet table {
            width: 100% !important;
            border: 1px solid #000000 !important;
            border-collapse: collapse !important;
            color: #000000 !important;
          }
          .official-report-sheet th,
          .official-report-sheet td {
            border: 1px solid #000000 !important;
            color: #000000 !important;
          }
          .report-section {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>
    </div>
  );
}
