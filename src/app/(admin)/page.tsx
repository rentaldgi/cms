import StatsCards from "@/components/dashboard/StatsCards";
import LatestArticles from "@/components/dashboard/LatestArticles";
import AnalyticsDashboard from "@/components/dashboard/AnalyticsDashboard";
import { fetchDashboardSummary } from "@/lib/dashboard";

export default async function AdminDashboardPage() {
  const summary = await fetchDashboardSummary();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard Dahlia Group
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Ringkasan performa trafik, leads WhatsApp, dan manajemen konten website
        </p>
      </div>

      {/* Analytics Dashboard with month/year/brand filters, chart, and leads distribution */}
      <AnalyticsDashboard />
    </div>
  );
}
