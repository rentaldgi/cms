import { Metadata } from "next";
import WhatsappAdminManagement from "@/components/whatsapp-admins/WhatsappAdminManagement";

export const metadata: Metadata = {
  title: "Admin WhatsApp | Dahlia Group CMS",
  description: "Kelola nomor WhatsApp admin untuk setiap entitas Dahlia Group",
};

export default function WhatsappAdminsPage() {
  return <WhatsappAdminManagement />;
}
