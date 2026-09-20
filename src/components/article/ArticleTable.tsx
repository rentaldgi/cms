"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image"; // ✅ Sekarang dipakai beneran
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Pagination from "../Pagination";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useSearch } from "@/layout/SearchContext";

import { apiFetch, assetUrl } from "@/lib/api";
interface Article {
  id: number;
  entity: string;
  title: string;
  slug: string;
  content: string;
  thumbnail: string;
  publishedAt: string;
  status: number;
  user: { name: string } | null;
}

export default function ArticleTable() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;
  const { searchTerm } = useSearch();

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async (): Promise<void> => {
    try {
      const res = await apiFetch("/article");
      if (!res.ok) throw new Error("Gagal mengambil data artikel.");
      const data: Article[] = await res.json();
      setArticles(data);
      setError(null);
    } catch (err) {
      console.error("Gagal mengambil data artikel:", err);
      setError("Gagal memuat data artikel. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number): Promise<void> => {
    if (!confirm("Yakin ingin menghapus artikel ini?")) return;

    try {
      const res = await apiFetch(`/article/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Gagal menghapus artikel.");
      }
      fetchArticles();
      alert("Artikel berhasil dihapus.");
    } catch (err) {
      alert(`Gagal menghapus artikel: ${(err as Error).message}`);
      console.error(err);
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderStatus = (status: number): string =>
    status === 1 ? "Published" : "Draft";

  const filteredArticles = articles.filter((article) => {
    const lowerSearch = searchTerm.toLowerCase();
    return (
      article.title.toLowerCase().includes(lowerSearch) ||
      article.slug.toLowerCase().includes(lowerSearch) ||
      article.content.toLowerCase().includes(lowerSearch) ||
      article.user?.name.toLowerCase().includes(lowerSearch)
    );
  });

  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);

  return (
    <div className="w-full overflow-x-auto">
      <Table className="w-full table-auto text-sm">
        <TableHeader className="bg-gray-300 text-xs uppercase">
          <TableRow>
            {[
              "ID",
              "Entity",
              "Judul",
              "Slug",
              "Konten",
              "Tanggal Publish",
              "Status",
              "Thumbnail",
              "Aksi",
            ].map((title) => (
              <TableCell key={title} className="text-center px-4 py-2">
                {title}
              </TableCell>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody className="divide-y divide-gray-200">
          {loading ? (
            <TableRow>
              <TableCell colSpan={11} className="text-center py-4">
                Memuat data...
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={11} className="text-center text-red-500 py-4">
                {error}
              </TableCell>
            </TableRow>
          ) : paginatedArticles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={11} className="text-center text-gray-500 py-4">
                Tidak ada data artikel.
              </TableCell>
            </TableRow>
          ) : (
            paginatedArticles.map((article) => (
              <TableRow key={article.id} className="hover:bg-gray-50 align-top">
                <TableCell className="text-center px-4 py-2">{article.id}</TableCell>
                <TableCell className="text-center px-4 py-2">{article.entity}</TableCell>
                <TableCell className="text-left px-4 py-2 max-w-[100px] truncate overflow-hidden">
                  {article.title}
                </TableCell>
                <TableCell className="text-left px-4 py-2 max-w-[100px] truncate overflow-hidden">
                  {article.slug}
                </TableCell>
                <TableCell className="text-left px-4 py-2 max-w-[100px] truncate overflow-hidden">
                  {article.content}
                </TableCell>
                <TableCell className="text-center px-4 py-2">
                  {formatDate(article.publishedAt)}
                </TableCell>
                <TableCell className="text-center px-4 py-2">
                  {renderStatus(article.status)}
                </TableCell>
                <TableCell className="text-center px-4 py-2">
                  {article.thumbnail?.trim() ? (
                    <Image
                      src={assetUrl(article.thumbnail)}
                      alt="Thumbnail"
                      width={80}
                      height={48}
                      className="object-cover rounded mx-auto"
                    />
                  ) : (
                    <span className="text-xs text-gray-500">Tidak ada foto</span>
                  )}
                </TableCell>
                <TableCell className="text-center px-4 py-2 space-x-2">
                  <Link href={`/article/edit/${article.slug}`} title="Edit">
                    <PencilSquareIcon className="w-5 h-5 inline-block text-blue-600 hover:text-blue-800 cursor-pointer" />
                  </Link>
                  <button onClick={() => handleDelete(article.id)} title="Hapus">
                    <TrashIcon className="w-5 h-5 inline-block text-red-600 hover:text-red-800 cursor-pointer" />
                  </button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
