"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Download,
  Printer,
  Filter,
  RefreshCw,
  FileText,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import OfficialReportPrintView from "./OfficialReportPrintView";

interface MonthlyReportData {
  period: {
    year: number;
    month: number;
    monthName: string;
    label: string;
    daysInMonth: number;
    startDate: string;
    endDate: string;
    filterEntity: { code: string; label: string } | null;
  };
  metrics: {
    websiteViews: {
      total: number;
      prevTotal: number;
      changePercentage: number;
    };
    whatsappClicks: {
      total: number;
      prevTotal: number;
      changePercentage: number;
    };
    conversionRate: {
      ratePercentage: number;
      prevRatePercentage: number;
      changePercentage: number;
    };
    articleViews: {
      total: number;
    };
    newArticles: {
      total: number;
    };
  };
  dailyTrend: Array<{
    day: number;
    date: string;
    websiteViews: number;
    whatsappClicks: number;
  }>;
  entityBreakdown: Array<{
    entity: string;
    entityLabel: string;
    brandName?: string;
    brandDomain?: string;
    websiteViews: number;
    whatsappClicks: number;
    articleViews: number;
    conversionRate: number;
  }>;
  adminBreakdown: Array<{
    adminId: number;
    name: string;
    phoneNumber: string;
    entity: string;
    entityLabel: string;
    brandName?: string;
    totalClicks: number;
  }>;
  allArticles?: Array<{
    id: number;
    title: string;
    slug: string;
    entity: string;
    entityLabel: string;
    brandName?: string;
    thumbnail: string;
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
    thumbnail: string;
    publishedAt?: string | null;
    publishedAtFormatted?: string;
    viewsInMonth: number;
  }>;
}

const MONTH_OPTIONS = [
  { value: 1, label: "Januari" },
  { value: 2, label: "Februari" },
  { value: 3, label: "Maret" },
  { value: 4, label: "April" },
  { value: 5, label: "Mei" },
  { value: 6, label: "Juni" },
  { value: 7, label: "Juli" },
  { value: 8, label: "Agustus" },
  { value: 9, label: "September" },
  { value: 10, label: "Oktober" },
  { value: 11, label: "November" },
  { value: 12, label: "Desember" },
];

export default function MonthlyReportView() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);

  const [report, setReport] = useState<MonthlyReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const years = Array.from({ length: 4 }, (_, i) => currentYear - i);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      params.set("year", selectedYear.toString());
      params.set("month", selectedMonth.toString());

      const res = await apiFetch(`/admin/reports/monthly?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Gagal memuat data laporan");
      }

      const data = await res.json();
      setReport(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat memuat laporan");
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!report) return;

    let csv = "LAPORAN BULANAN DAHLIA GROUP\n";
    csv += `Periode: ${report.period.label}\n\n`;

    csv += "RINGKASAN TRAFFIC & LEADS\n";
    csv += `Pengunjung Website,${report.metrics.websiteViews.total} (Bulan lalu: ${report.metrics.websiteViews.prevTotal})\n`;
    csv += `Leads WhatsApp,${report.metrics.whatsappClicks.total} (Bulan lalu: ${report.metrics.whatsappClicks.prevTotal})\n`;
    csv += `Konversi Leads,${report.metrics.conversionRate.ratePercentage}%\n`;
    csv += `Pembaca Artikel,${report.metrics.articleViews.total}\n`;
    csv += `Artikel Diterbitkan,${report.metrics.newArticles.total}\n\n`;

    csv += "PERFORMA PER WEBSITE\n";
    csv += "Website,Pengunjung Website,Klik WhatsApp,Pembaca Artikel,Tingkat Konversi (%)\n";
    report.entityBreakdown.forEach((item) => {
      csv += `"${item.brandName || item.entityLabel}",${item.websiteViews},${item.whatsappClicks},${item.articleViews},${item.conversionRate}%\n`;
    });
    csv += "\n";

    csv += "LEADS PER ADMIN WHATSAPP\n";
    csv += "Nama Admin,Nomor Telepon,Brand/Website,Total Leads\n";
    report.adminBreakdown.forEach((admin) => {
      csv += `"${admin.name}","${admin.phoneNumber}","${admin.brandName || admin.entityLabel}",${admin.totalClicks}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Laporan_Dahlia_Group_${report.period.monthName}_${report.period.year}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls (Hidden in Print Mode) */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between print:hidden">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-brand-500" />
            <span>Laporan Bulanan Dahlia Group</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Input catatan maintenance dan cetak template laporan resmi bulanan dalam format PDF
          </p>
        </div>

        {/* Action Buttons: Export & Print */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchReport}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition"
            title="Muat Ulang Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-brand-500" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Bar (Hidden in Print Mode) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] print:hidden shadow-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
            <Filter className="w-4 h-4 text-brand-500" />
            <span>Pilih Periode Laporan:</span>
          </div>

          {/* Month Selector */}
          <div className="min-w-[140px]">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              {MONTH_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Year Selector */}
          <div className="min-w-[110px]">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  Tahun {y}
                </option>
              ))}
            </select>
          </div>

          {/* Active Period Label */}
          {report && (
            <div className="ml-auto text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-brand-500" />
              <span>
                Periode data: <strong>{report.period.startDate}</strong> s/d{" "}
                <strong>{report.period.endDate}</strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-white/[0.03]">
          <RefreshCw className="w-8 h-8 animate-spin text-brand-500 mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Menyiapkan laporan bulanan Dahlia Group...</p>
        </div>
      ) : report ? (
        /* Render Official Report View directly */
        <OfficialReportPrintView report={report} />
      ) : null}
    </div>
  );
}
