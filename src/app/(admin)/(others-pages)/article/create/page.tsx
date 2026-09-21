import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import DefaultInputs from "@/components/article/DefaultInputs";

import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Tambah Artikel | CMS Dahlia Group",
  description:
    "Halaman tambah artikel CMS Dahlia Group",
};

export default function CreateArticle() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Create article" />
      
      {/* Container biasa tanpa grid */}
      <div className="space-y-6">
        <DefaultInputs />
      </div>
    </div>
  );
}

