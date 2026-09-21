import StatsCards from "@/components/dashboard/StatsCards";
import LatestArticles from "@/components/dashboard/LatestArticles";
import { fetchArticles } from "@/lib/server-api";

type Article = {
  id: number;
  title: string;
  slug: string;
  entity: string;
  thumbnail?: string;
  status?: boolean | number;
  publishedAt?: string;
  createdAt?: string;
};

export default async function AdminDashboardPage() {
  const articles: Article[] = await fetchArticles();

  const isPublished = (status?: boolean | number) =>
    status === true || status === 1;

  const publishedCount = articles.filter((a) => isPublished(a.status)).length;

  const perEntity = articles.reduce<Record<string, number>>((acc, article) => {
    acc[article.entity] = (acc[article.entity] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Ringkasan konten Dahlia Group
        </p>
      </div>

      <StatsCards
        articleCount={articles.length}
        publishedCount={publishedCount}
        draftCount={articles.length - publishedCount}
        perEntity={perEntity}
      />

      <LatestArticles articles={articles} />
    </div>
  );
}
