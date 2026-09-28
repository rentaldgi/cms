import AnalyticsDashboard from "@/components/dashboard/AnalyticsDashboard";

export default function AdminDashboardPage() {
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

      <AnalyticsDashboard />
    </div>
  );
}

