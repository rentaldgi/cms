"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Label from "@/components/form/Label";
import Input from "@/components/form/InputField";
import Select from "@/components/form/Select";
import RadioGroup from "@/components/form/Radio";
import { apiFetch } from "@/lib/api";
import { ENTITIES } from "@/lib/entities";

export interface LocationData {
  id: number;
  kota: string;
  alamat: string;
  embedUrl: string;
  link: string | null;
  entity: string;
  urutan: number;
  status: boolean;
}

interface Props {
  initialData?: LocationData;
}

/**
 * Admin biasanya menyalin kode <iframe ...> dari Google Maps (Bagikan → Sematkan
 * peta). Yang disimpan backend hanya isi atribut src-nya, jadi diambil di sini.
 */
export function extractEmbedSrc(value: string) {
  const trimmed = value.trim();
  const match = trimmed.match(/<iframe[^>]*\ssrc=["']([^"']+)["']/i);
  return match ? match[1] : trimmed;
}

function embedWarning(url: string) {
  if (!url) return "";
  if (/maps\.app\.goo\.gl|goo\.gl\/maps/i.test(url)) {
    return "Ini link bagikan biasa, bukan kode sematan. Peta tidak akan tampil di website. Isi link ini di kolom Link Google Maps, lalu ambil kode sematan lewat Bagikan → Sematkan peta.";
  }
  if (!/^https:\/\/(www\.)?google\.[a-z.]+\/maps/i.test(url)) {
    return "Alamat ini bukan dari Google Maps. Pastikan yang ditempel adalah kode dari Bagikan → Sematkan peta.";
  }
  return "";
}

export default function LocationForm({ initialData }: Props) {
  const router = useRouter();
  const editMode = Boolean(initialData);

  const [entity, setEntity] = useState("");
  const [kota, setKota] = useState("");
  const [alamat, setAlamat] = useState("");
  const [embedInput, setEmbedInput] = useState("");
  const [link, setLink] = useState("");
  const [urutan, setUrutan] = useState("0");
  const [status, setStatus] = useState("1");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!initialData) return;
    setEntity(initialData.entity);
    setKota(initialData.kota);
    setAlamat(initialData.alamat);
    setEmbedInput(initialData.embedUrl);
    setLink(initialData.link ?? "");
    setUrutan(String(initialData.urutan ?? 0));
    setStatus(initialData.status ? "1" : "0");
  }, [initialData]);

  const embedUrl = extractEmbedSrc(embedInput);
  const warning = embedWarning(embedUrl);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!entity || !kota.trim() || !alamat.trim() || !embedUrl) {
      setError("Website, kota, alamat, dan peta Google Maps harus diisi");
      return;
    }

    setSaving(true);
    try {
      const res = await apiFetch(
        editMode ? `/admin/locations/${initialData!.id}` : "/admin/locations",
        {
          method: editMode ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entity,
            kota: kota.trim(),
            alamat: alamat.trim(),
            embedUrl,
            link: link.trim() || undefined,
            urutan: Number(urutan) || 0,
            status: status === "1",
          }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const detail = Array.isArray(data?.errors)
          ? data.errors.map((e: { message: string }) => e.message).join(", ")
          : "";
        setError(detail || data?.message || "Gagal menyimpan lokasi");
        return;
      }

      const success = data?.message || "Lokasi berhasil disimpan";
      router.push(`/locations?success=${encodeURIComponent(success)}`);
    } catch {
      setError("Tidak bisa terhubung ke server");
    } finally {
      setSaving(false);
    }
  };

  const textareaClass =
    "w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Kiri: data lokasi */}
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label>Website</Label>
              <Select
                options={[...ENTITIES]}
                placeholder="Pilih website"
                value={entity}
                onChange={setEntity}
              />
            </div>
            <div>
              <Label htmlFor="kota">Kota</Label>
              <Input
                id="kota"
                value={kota}
                onChange={(e) => setKota(e.target.value)}
                placeholder="Contoh: Bandung"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="alamat">Alamat</Label>
            <textarea
              id="alamat"
              rows={3}
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              placeholder="Alamat lengkap yang tampil di bawah peta"
              className={textareaClass}
            />
          </div>

          <div>
            <Label htmlFor="embed">Peta Google Maps</Label>
            <textarea
              id="embed"
              rows={4}
              value={embedInput}
              onChange={(e) => setEmbedInput(e.target.value)}
              placeholder='Tempel kode dari Google Maps, contoh: <iframe src="https://www.google.com/maps/embed?pb=..."'
              className={`${textareaClass} font-mono text-xs`}
            />
            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
              Buka lokasi di Google Maps → Bagikan → Sematkan peta → Salin HTML,
              lalu tempel di sini. Kode lengkap atau hanya URL-nya sama-sama bisa.
            </p>
            {warning && (
              <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                {warning}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="link">Link Google Maps (opsional)</Label>
            <Input
              id="link"
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://maps.app.goo.gl/..."
              hint="Dibuka saat pengunjung mengklik alamat. Kalau kosong, website mencari alamat di Google Maps."
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="urutan">Urutan tampil</Label>
              <Input
                id="urutan"
                type="number"
                min="0"
                value={urutan}
                onChange={(e) => setUrutan(e.target.value)}
                hint="Angka kecil tampil lebih dulu"
              />
            </div>
            <div>
              <Label>Status</Label>
              <RadioGroup
                name="status"
                selectedValue={status}
                onChange={setStatus}
                options={[
                  { value: "1", label: "Aktif" },
                  { value: "0", label: "Nonaktif" },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Kanan: pratinjau peta */}
        <div>
          <Label>Pratinjau</Label>
          <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03]">
            {embedUrl && !warning ? (
              <iframe
                src={embedUrl}
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Pratinjau peta"
              />
            ) : (
              <p className="px-6 text-center text-sm text-gray-400">
                Peta akan tampil di sini setelah kode Google Maps ditempel
              </p>
            )}
          </div>
          {kota && (
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-800 dark:text-white/90">
                {kota}
              </span>
              {alamat && ` — ${alamat}`}
            </p>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="mt-6 flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:opacity-60"
        >
          {saving ? "Menyimpan..." : editMode ? "Perbarui" : "Simpan"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/locations")}
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
