"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; 
import ComponentCard from "../common/ComponentCard";
import Label from "./Label";
import Input from "./InputField";
import FileInput from "./FileInput";
import Select from "./Select";
import RadioGroup from "./Radio";

import { apiFetch, assetUrl } from "@/lib/api";
import { ENTITIES } from "@/lib/entities";
interface ArticleData {
  id: number;
  title: string;
  entity: string;
  content: string;
  thumbnail?: string;
  // Backend mengirim boolean; data lama bisa berupa 0/1 atau "0"/"1"
  status: boolean | string | number;
  publishedAt?: string;
}

/** Ubah status apa pun bentuknya jadi nilai radio: "1" (terbit) atau "0" (draf). */
function toStatusValue(status: ArticleData["status"] | undefined) {
  return status === true || status === 1 || status === "1" || status === "true"
    ? "1"
    : "0";
}

interface Props {
  editMode?: boolean;
  initialData?: ArticleData;
}

export default function DefaultInputs({ editMode = false, initialData }: Props) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [entity, setEntity] = useState("");
  const [content, setContent] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [oldThumbnailUrl, setOldThumbnailUrl] = useState("");
  const [status, setStatus] = useState("0");
  // Tanggal terbit asli dipertahankan saat mengedit, supaya tidak berubah
  // jadi hari ini setiap kali artikel diperbaiki
  const [publishedAt, setPublishedAt] = useState("");
  const [userId] = useState(1);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [id, setId] = useState<number | null>(null);

  useEffect(() => {
    if (editMode && initialData) {
      setId(initialData.id);
      setTitle(initialData.title || "");
      setEntity(initialData.entity || "");
      setContent(initialData.content || "");
      setStatus(toStatusValue(initialData.status));
      setPublishedAt(initialData.publishedAt || "");
      setOldThumbnailUrl(
        initialData.thumbnail ? assetUrl(initialData.thumbnail) : ""
      );
    }
  }, [editMode, initialData]);

  const handleSubmit = async () => {
    setError("");

    if (!entity || !title.trim() || !content.trim()) {
      setError("Entity, judul, dan konten harus diisi");
      return;
    }

    if (!editMode && !thumbnail) {
      setError("Thumbnail harus dipilih");
      return;
    }

    setSaving(true);

    const url = editMode && id ? `/article/${id}` : "/article";

    const method = editMode ? "PUT" : "POST";

    try {
      let response: Response;

      if (thumbnail || !editMode) {
        const formData = new FormData();
        formData.append("entity", entity);
        formData.append("title", title);
        formData.append("content", content);
        formData.append("userId", userId.toString());
        formData.append("status", status);
        formData.append("publishedAt", publishedAt || new Date().toISOString());

        if (thumbnail) {
          formData.append("thumbnail", thumbnail);
        }

        response = await apiFetch(url, {
          method,
          body: formData,
        });
      } else {
        response = await apiFetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entity,
            title,
            content,
            userId,
            status,
            publishedAt: publishedAt || new Date().toISOString(),
          }),
        });
      }

      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        throw new Error("Respons server tidak dikenali");
      }

      const data = await response.json();

      if (!response.ok) {
        const detail = Array.isArray(data?.errors)
          ? data.errors.map((e: { message: string }) => e.message).join(", ")
          : "";
        setError(detail || data?.message || "Gagal menyimpan artikel");
        return;
      }

      const success = data?.message || "Artikel berhasil disimpan";
      router.push(`/article?success=${encodeURIComponent(success)}`);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan saat mengirim data"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push("/article");
  };

  return (
    <ComponentCard title="">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Website</Label>
            <Select
              options={[...ENTITIES]}
              placeholder="Pilih website"
              onChange={(value) => setEntity(value)}
              value={entity}
            />
          </div>
          <div>
            <Label>Status</Label>
            <RadioGroup
              options={[
                { value: "1", label: "Terbit" },
                { value: "0", label: "Draf" },
              ]}
              name="status"
              selectedValue={status}
              onChange={(value) => setStatus(value)}
            />
          </div>
        </div>

        <div>
          <Label>Judul Artikel</Label>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Judul"
          />
        </div>

        <div>
          <Label>Konten</Label>
          <textarea
            className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90"
            rows={8}
            placeholder="Tulis isi artikel di sini"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div>
          <Label>Thumbnail</Label>
          {editMode && oldThumbnailUrl && !thumbnail && (
            <Image
              src={oldThumbnailUrl}
              alt="Thumbnail lama"
              width={128}
              height={80}
              className="object-cover rounded mb-2"
            />
          )}
          <FileInput
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setThumbnail(file);
            }}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:opacity-60"
          >
            {saving ? "Menyimpan..." : editMode ? "Perbarui" : "Simpan"}
          </button>
          <button
            type="button"
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
            onClick={handleCancel}
          >
            Batal
          </button>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    </ComponentCard>
  );
}
