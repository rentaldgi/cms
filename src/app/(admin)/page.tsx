import StatsCards from "@/components/dashboard/StatsCards";
import LatestArticles from "@/components/dashboard/LatestArticles";
import { fetchDashboardSummary } from "@/lib/dashboard";

export default async function AdminDashboardPage() {
  const summary = await fetchDashboardSummary();

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
        articleCount={summary.totalArticles}
        publishedCount={summary.published}
        draftCount={summary.draft}
        perEntity={summary.perEntity}
      />

      <LatestArticles articles={summary.latest} />
    </div>
  );
}
