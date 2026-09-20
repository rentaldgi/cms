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
interface ArticleData {
  id: number;
  title: string;
  entity: string;
  content: string;
  thumbnail?: string;
  status: string | number;
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
  const [userId] = useState(1);
  const [message, setMessage] = useState("");
  const [id, setId] = useState<number | null>(null);

  useEffect(() => {
    if (editMode && initialData) {
      console.log("Memuat data awal ke form:", initialData);
      setId(initialData.id);
      setTitle(initialData.title || "");
      setEntity(initialData.entity || "");
      setContent(initialData.content || "");
      setStatus(String(initialData.status ?? "0"));
      setOldThumbnailUrl(
        initialData.thumbnail ? assetUrl(initialData.thumbnail) : ""
      );
    }
  }, [editMode, initialData]);

  const handleSubmit = async () => {
    setMessage("");

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
        formData.append("publishedAt", new Date().toISOString());

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
            publishedAt: new Date().toISOString(),
          }),
        });
      }

      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        throw new Error("Invalid response (bukan JSON)");
      }

      const data = await response.json();

      if (!response.ok) {
        setMessage("");
        return;
      }

      router.push(`/article?success=${encodeURIComponent(data.message)}`);
    } catch (error: unknown) {
      const err = error instanceof Error ? error.message : "Terjadi kesalahan saat mengirim data.";
      console.error("Error:", err);
      setMessage(err);
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
            <Label>Entity</Label>
            <Select
              options={[
                { value: "RENTAL_MOTOR", label: "Rental Motor" },
                { value: "RENTAL_IPHONE", label: "Rental iPhone" },
                { value: "SEWA_APARTMENT", label: "Sewa Apartment" },
              ]}
              placeholder="Pilih Entity"
              onChange={(value) => setEntity(value)}
              value={entity}
            />
          </div>
          <div>
            <Label>Status</Label>
            <RadioGroup
              options={[
                { value: "1", label: "Publish" },
                { value: "0", label: "Draft" },
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
            className="w-full border px-3 py-2 rounded"
            rows={5}
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
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {editMode ? "Perbarui" : "Simpan"}
          </button>
          <button
            type="button"
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            onClick={handleCancel}
          >
            Batal
          </button>
        </div>

        {message && <p className="text-green-600">{message}</p>}
      </div>
    </ComponentCard>
  );
}
