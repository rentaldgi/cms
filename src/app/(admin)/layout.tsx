"use client";

import React from "react";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import { SearchProvider } from "@/layout/SearchContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";

function InnerLayout({ children }: { children: React.ReactNode }) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <div className="min-h-screen xl:flex overflow-x-hidden print:block print:overflow-visible print:min-h-0 print:m-0 print:p-0">
      <AppSidebar />
      <Backdrop />

      <div
        className={`min-w-0 flex-1 transition-all duration-300 ease-in-out ${mainContentMargin} print:ml-0 print:p-0 print:m-0`}
      >
        <AppHeader />
        <div className="p-4 md:p-6 mx-auto w-full max-w-7xl overflow-x-hidden print:p-0 print:m-0 print:max-w-none print:overflow-visible">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <SearchProvider>
        <InnerLayout>{children}</InnerLayout>
      </SearchProvider>
    </SidebarProvider>
  );
}
