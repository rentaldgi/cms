import Link from "next/link";
import Image from "next/image";
import Badge from "@/components/ui/badge/Badge";
import { assetUrl } from "@/lib/api";
import { entityLabel } from "@/lib/entities";

interface Article {
  id: number;
  title: string;
  slug: string;
  entity: string;
  thumbnail?: string;
  publishedAt?: string;
  createdAt?: string;
}

export default function LatestArticles({ articles }: { articles: Article[] }) {
  const latest = [...articles]
    .sort(
      (a, b) =>
        new Date(b.createdAt || b.publishedAt || 0).getTime() -
        new Date(a.createdAt || a.publishedAt || 0).getTime()
    )
    .slice(0, 5);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-gray-800 dark:text-white/90">
          Artikel Terbaru
        </h2>
        <Link
          href="/article"
          className="text-sm text-brand-500 transition hover:text-brand-600"
        >
          Lihat semua
        </Link>
      </div>

      {latest.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Belum ada artikel.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-gray-100 dark:divide-gray-800">
          {latest.map((article) => (
            <li key={article.id}>
              <Link
                href={`/article/edit/${article.slug}`}
                className="-mx-2 flex items-center gap-4 rounded-lg px-2 py-3 transition hover:bg-gray-50 dark:hover:bg-white/[0.03]"
              >
                <div className="h-11 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-white/10">
                  {article.thumbnail?.trim() && (
                    <Image
                      src={assetUrl(article.thumbnail)}
                      alt={article.title}
                      width={56}
                      height={44}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                <span className="min-w-0 flex-1 truncate text-sm text-gray-700 dark:text-gray-300">
                  {article.title}
                </span>

                <Badge color="blue">{entityLabel(article.entity)}</Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
