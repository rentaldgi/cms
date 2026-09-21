import { Metadata } from "next";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import LocationForm from "@/components/location/LocationForm";

export const metadata: Metadata = {
  title: "Tambah Lokasi | CMS Dahlia Group",
};

export default function CreateLocationPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Tambah Lokasi" />
      <LocationForm />
    </div>
  );
}
