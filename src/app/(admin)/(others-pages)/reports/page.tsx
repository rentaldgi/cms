import { Metadata } from "next";
import MonthlyReportView from "@/components/reports/MonthlyReportView";

export const metadata: Metadata = {
  title: "Laporan Bulanan | Dahlia Group CMS",
  description: "Laporan performa dan analitik bulanan Dahlia Group",
};

export default function MonthlyReportPage() {
  return <MonthlyReportView />;
}
