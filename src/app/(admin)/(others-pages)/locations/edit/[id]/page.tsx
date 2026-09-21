"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import LocationForm, { type LocationData } from "@/components/location/LocationForm";
import { apiFetch } from "@/lib/api";

export default function EditLocationPage() {
  const { id } = useParams<{ id: string }>();
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch(`/admin/locations/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error();
        setLocation(await res.json());
      })
      .catch(() => setError("Lokasi tidak ditemukan"));
  }, [id]);

  return (
    <div>
      <PageBreadcrumb pageTitle="Ubah Lokasi" />
      {error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </p>
      ) : location ? (
        <LocationForm initialData={location} />
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">Memuat data...</p>
      )}
    </div>
  );
}
