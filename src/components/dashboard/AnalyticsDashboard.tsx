"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Download,
  TrendingUp,
  TrendingDown,
  Users,
  MessageCircle,
  Eye,
  BookOpen,
  Filter,
  RefreshCw,
  Award,
  ChevronRight,
  BarChart2,
  FileText,
} from "lucide-react";
import { apiFetch, assetUrl } from "@/lib/api";
import { ENTITIES, entityLabel, brandName, brandDomain } from "@/lib/entities";
import Badge from "@/components/ui/badge/Badge";

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

export default function AnalyticsDashboard() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedEntity, setSelectedEntity] = useState<string>("");
  const [chartMetric, setChartMetric] = useState<"websiteViews" | "whatsappClicks">("websiteViews");

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
      if (selectedEntity) {
        params.set("entity", selectedEntity);
      }

      const res = await apiFetch(`/admin/reports/monthly?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Gagal memuat data statistik");
      }

      const data = await res.json();
      setReport(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedMonth, selectedEntity]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const maxDailyViews = report ? Math.max(1, ...report.dailyTrend.map((d) => d[chartMetric])) : 1;

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
              <Filter className="w-4 h-4 text-brand-500" />
              <span>Periode Analisis:</span>
            </div>

            {/* Month Selector */}
            <div className="min-w-[130px]">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs sm:text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                {MONTH_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Selector */}
            <div className="min-w-[100px]">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs sm:text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    Tahun {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Entity Selector */}
            <div className="min-w-[150px]">
              <select
                value={selectedEntity}
                onChange={(e) => setSelectedEntity(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs sm:text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Semua Brand</option>
                {ENTITIES.map((ent) => (
                  <option key={ent.value} value={ent.value}>
                    {ent.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {report && (
              <span className="hidden sm:inline text-xs text-gray-500 dark:text-gray-400">
                {report.period.startDate} s/d {report.period.endDate}
              </span>
            )}
            <button
              onClick={fetchReport}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 transition"
              title="Perbarui Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-brand-500" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-white/[0.03]">
          <RefreshCw className="w-8 h-8 animate-spin text-brand-500 mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Memuat analisis performa traffic & leads...</p>
        </div>
      ) : report ? (
        <div className="space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1: Website Visitors */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Pengunjung Website
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  <Users className="w-5 h-5" />
                </span>
              </div>
              <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
                {report.metrics.websiteViews.total.toLocaleString("id-ID")}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs">
                {report.metrics.websiteViews.changePercentage >= 0 ? (
                  <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-semibold">
                    <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                    +{report.metrics.websiteViews.changePercentage}%
                  </span>
                ) : (
                  <span className="flex items-center text-red-600 dark:text-red-400 font-semibold">
                    <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                    {report.metrics.websiteViews.changePercentage}%
                  </span>
                )}
                <span className="text-gray-400 dark:text-gray-500">
                  vs bulan lalu ({report.metrics.websiteViews.prevTotal.toLocaleString("id-ID")})
                </span>
              </div>
            </div>

            {/* Card 2: WhatsApp Leads */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Leads WhatsApp
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <MessageCircle className="w-5 h-5" />
                </span>
              </div>
              <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
                {report.metrics.whatsappClicks.total.toLocaleString("id-ID")}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs">
                {report.metrics.whatsappClicks.changePercentage >= 0 ? (
                  <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-semibold">
                    <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                    +{report.metrics.whatsappClicks.changePercentage}%
                  </span>
                ) : (
                  <span className="flex items-center text-red-600 dark:text-red-400 font-semibold">
                    <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                    {report.metrics.whatsappClicks.changePercentage}%
                  </span>
                )}
                <span className="text-gray-400 dark:text-gray-500">
                  vs bulan lalu ({report.metrics.whatsappClicks.prevTotal.toLocaleString("id-ID")})
                </span>
              </div>
            </div>

            {/* Card 3: Conversion Rate */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Tingkat Konversi
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                  <Award className="w-5 h-5" />
                </span>
              </div>
              <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
                {report.metrics.conversionRate.ratePercentage}%
              </p>
              <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                <span>Rasio pengunjung yang menghubungi WA</span>
              </div>
            </div>

            {/* Card 4: Article Readers & Content */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Pembaca Artikel Terbitan Bulan Ini
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
                  <BookOpen className="w-5 h-5" />
                </span>
              </div>
              <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
                {report.metrics.articleViews.total.toLocaleString("id-ID")}{" "}
                <span className="text-sm font-normal text-gray-400">reads</span>
              </p>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span>
                  Dari <strong>{report.metrics.newArticles.total}</strong> artikel terbit di {report.period.label}
                </span>
              </div>
            </div>
          </div>

          {/* Daily Trend Chart */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  Tren Aktivitas Harian ({report.period.label})
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Distribusi dari tanggal 1 sampai {report.period.daysInMonth} {report.period.label}
                </p>
              </div>

              {/* Metric Toggle */}
              <div className="flex items-center rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
                <button
                  type="button"
                  onClick={() => setChartMetric("websiteViews")}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                    chartMetric === "websiteViews"
                      ? "bg-white text-blue-600 shadow-xs dark:bg-gray-700 dark:text-blue-400"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  }`}
                >
                  Pengunjung Website
                </button>
                <button
                  type="button"
                  onClick={() => setChartMetric("whatsappClicks")}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                    chartMetric === "whatsappClicks"
                      ? "bg-white text-emerald-600 shadow-xs dark:bg-gray-700 dark:text-emerald-400"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  }`}
                >
                  Klik WhatsApp
                </button>
              </div>
            </div>

            {/* Interactive Bar Chart Visualization */}
            <div className="h-48 w-full flex items-end gap-1 sm:gap-2 pt-6 pb-2 border-b border-gray-200 dark:border-gray-800">
              {report.dailyTrend.map((item) => {
                const val = item[chartMetric];
                const heightPct = Math.max(4, (val / maxDailyViews) * 100);
                const isWa = chartMetric === "whatsappClicks";

                return (
                  <div
                    key={item.day}
                    className="group relative flex-1 flex flex-col items-center h-full justify-end cursor-pointer"
                  >
                    {/* Tooltip on hover */}
                    <div className="pointer-events-none absolute -top-12 z-20 hidden group-hover:flex flex-col items-center rounded-md bg-gray-900 px-2 py-1 text-[11px] text-white shadow-lg dark:bg-gray-700 whitespace-nowrap">
                      <span>Tgl {item.day}: {val} {isWa ? "klik" : "view"}</span>
                      <div className="w-2 h-2 rotate-45 bg-gray-900 dark:bg-gray-700 -mb-1"></div>
                    </div>

                    {/* Bar */}
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t-sm transition-all duration-300 ${
                        isWa
                          ? "bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600"
                          : "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600"
                      } ${val === 0 ? "opacity-20" : "opacity-90 group-hover:opacity-100"}`}
                    />
                    <span className="text-[10px] text-gray-400 mt-1">{item.day}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between items-center text-xs text-gray-400 mt-2">
              <span>Hari ke-1</span>
              <span className="font-medium text-gray-600 dark:text-gray-300">
                Puncak tertinggi: {maxDailyViews} {chartMetric === "whatsappClicks" ? "klik WA" : "pengunjung"} / hari
              </span>
              <span>Hari ke-{report.period.daysInMonth}</span>
            </div>
          </div>

          {/* Two Column Section: Entity Breakdown & Top WhatsApp Admins */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left Column: Brand/Entity Breakdown */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] shadow-xs">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                Performa per Brand / Entitas
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-gray-200 bg-gray-50/50 text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
                    <tr>
                      <th className="py-2.5 px-3">Brand</th>
                      <th className="py-2.5 px-3 text-right">Pengunjung</th>
                      <th className="py-2.5 px-3 text-right">Leads WA</th>
                      <th className="py-2.5 px-3 text-right">Konversi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {report.entityBreakdown.map((row) => (
                      <tr key={row.entity} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                        <td className="py-3 px-3 font-medium text-gray-800 dark:text-white/90">
                          {row.brandName || row.entityLabel}
                        </td>
                        <td className="py-3 px-3 text-right text-gray-600 dark:text-gray-300">
                          {row.websiteViews.toLocaleString("id-ID")}
                        </td>
                        <td className="py-3 px-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                          {row.whatsappClicks.toLocaleString("id-ID")}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Badge color={row.conversionRate >= 5 ? "green" : "gray"}>
                            {row.conversionRate}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column: WhatsApp Admins Leads Distribution */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  Distribusi Leads per Admin WA
                </h2>
                <Link
                  href="/whatsapp-admins"
                  className="text-xs font-medium text-brand-500 hover:text-brand-600 flex items-center gap-0.5"
                >
                  Kelola Admin <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {report.adminBreakdown.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-400">
                  Belum ada catatan klik WhatsApp di bulan ini.
                </div>
              ) : (
                <div className="space-y-3">
                  {report.adminBreakdown.map((admin) => {
                    const totalClicks = report.metrics.whatsappClicks.total;
                    const pct = totalClicks > 0 ? (admin.totalClicks / totalClicks) * 100 : 0;

                    return (
                      <div
                        key={`${admin.adminId}-${admin.entity}`}
                        className="rounded-xl border border-gray-100 bg-gray-50/50 p-3.5 dark:border-gray-800 dark:bg-gray-800/40"
                      >
                        <div className="flex items-center justify-between text-sm">
                          <div>
                            <span className="font-semibold text-gray-800 dark:text-white">
                              {admin.name}
                            </span>
                            <span className="ml-2 text-xs text-gray-400">({admin.phoneNumber})</span>
                          </div>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {admin.totalClicks} leads ({pct.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {admin.brandName || admin.entityLabel}
                          </span>
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                            <div
                              className="h-full rounded-full bg-emerald-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Top Read Articles in Month */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  Artikel yang Diterbitkan di {report.period.label}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Diurutkan berdasarkan pembaca terbanyak sepanjang periode {report.period.label}
                </p>
              </div>
              <Link
                href="/article"
                className="text-xs font-medium text-brand-500 hover:text-brand-600 flex items-center gap-0.5"
              >
                Kelola Semua Artikel <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {report.topArticles.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400 border border-dashed border-gray-200 rounded-xl dark:border-gray-800">
                Tidak ada artikel yang diterbitkan pada bulan {report.period.label}.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {report.topArticles.map((art, idx) => (
                  <div
                    key={art.id}
                    className="flex flex-col rounded-xl border border-gray-200 overflow-hidden bg-white dark:border-gray-800 dark:bg-gray-800/50 hover:shadow-sm transition"
                  >
                    <div className="relative h-28 w-full bg-gray-100 dark:bg-gray-800">
                      {art.thumbnail ? (
                        <Image
                          src={assetUrl(art.thumbnail)}
                          alt={art.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                      <span className="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs font-bold text-white">
                        #{idx + 1}
                      </span>
                      {art.publishedAt && (
                        <span className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white backdrop-blur-xs">
                          {art.publishedAtFormatted || art.publishedAt}
                        </span>
                      )}
                    </div>

                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-500">
                          {art.brandName || art.entityLabel}
                        </span>
                        <h3 className="text-xs font-medium text-gray-800 dark:text-white line-clamp-2 mt-1">
                          {art.title}
                        </h3>
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1 font-medium">
                          <Eye className="w-3.5 h-3.5 text-brand-500" />
                          {art.viewsInMonth} views
                        </span>
                        <Link
                          href={`/article/edit/${art.slug}`}
                          className="text-brand-500 hover:underline text-xs font-medium"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
