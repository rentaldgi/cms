"use client";

import React from "react";
import Badge from "@/components/ui/badge/Badge";
import { ENTITIES, entityLabel } from "@/lib/entities";

interface Props {
  articleCount: number;
  publishedCount: number;
  draftCount: number;
  perEntity: Record<string, number>;
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-800 dark:text-white/90">
        {value.toLocaleString("id-ID")}
      </p>
    </div>
  );
}

export default function StatsCards({
  articleCount,
  publishedCount,
  draftCount,
  perEntity,
}: Props) {
  const max = Math.max(1, ...ENTITIES.map((e) => perEntity[e.value] ?? 0));

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Total Artikel" value={articleCount} />
        <Stat label="Terbit" value={publishedCount} />
        <Stat label="Draf" value={draftCount} />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="text-sm font-medium text-gray-800 dark:text-white/90">
          Artikel per Website
        </h2>

        <div className="mt-4 space-y-3">
          {ENTITIES.map((item) => {
            const count = perEntity[item.value] ?? 0;
            return (
              <div key={item.value} className="flex items-center gap-4">
                <span className="w-32 shrink-0 text-sm text-gray-600 dark:text-gray-400">
                  {entityLabel(item.value)}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                  <div
                    className="h-full rounded-full bg-brand-500"
                    style={{ width: `${(count / max) * 100}%` }}
                  />
                </div>
                <Badge color="gray">{count}</Badge>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
