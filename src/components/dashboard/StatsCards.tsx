"use client";

import React from "react";
import Link from "next/link";
import Badge from "@/components/ui/badge/Badge";
import { ENTITIES, entityLabel } from "@/lib/entities";
import {
  FileText,
  CheckCircle,
  Clock,
  BarChart3,
  MessageCircle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

interface Props {
  articleCount: number;
  publishedCount: number;
  draftCount: number;
  perEntity: Record<string, number>;
}

export default function StatsCards({
  articleCount,
  publishedCount,
  draftCount,
  perEntity,
}: Props) {
  const max = Math.max(1, ...ENTITIES.map((e) => perEntity[e.value] ?? 0));

  return (
    <div className="space-y-5">
      {/* Quick Action Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 p-6 text-white shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-xs mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Analisis & Pelaporan Baru</span>
            </div>
            <h2 className="text-xl font-bold">Laporan Performa Bulanan Tersedia</h2>
            <p className="mt-1 text-sm text-white/90">
              Pantau tren pengunjung harian, konversi klik WhatsApp, dan pembaca artikel untuk seluruh unit bisnis Dahlia Group.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/reports"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-brand-600 shadow-xs hover:bg-gray-50 transition"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Buka Laporan Bulanan</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/whatsapp-admins"
              className="inline-flex items-center gap-2 rounded-xl bg-black/20 hover:bg-black/30 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-xs transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Admin WA</span>
            </Link>
          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute -right-12 -bottom-12 h-44 w-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-48 -top-12 h-36 w-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Total Artikel
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <FileText className="w-5 h-5" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
            {articleCount.toLocaleString("id-ID")}
          </p>
          <p className="mt-1 text-xs text-gray-400">Dari semua website entitas</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Artikel Terbit
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <CheckCircle className="w-5 h-5" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
            {publishedCount.toLocaleString("id-ID")}
          </p>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            Tayang di website publik
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Artikel Draf
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
              <Clock className="w-5 h-5" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
            {draftCount.toLocaleString("id-ID")}
          </p>
          <p className="mt-1 text-xs text-gray-400">Belum dipublikasikan</p>
        </div>
      </div>

      {/* Distribution by Website Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-white/90">
            Distribusi Artikel per Website
          </h2>
          <Link
            href="/article"
            className="text-xs font-medium text-brand-500 hover:text-brand-600 flex items-center gap-1"
          >
            <span>Kelola Artikel</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3.5">
          {ENTITIES.map((item) => {
            const count = perEntity[item.value] ?? 0;
            const pct = (count / max) * 100;
            return (
              <div key={item.value} className="flex items-center gap-4">
                <span className="w-36 shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {entityLabel(item.value)}
                </span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-amber-500 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <Badge color="gray">{count} artikel</Badge>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
