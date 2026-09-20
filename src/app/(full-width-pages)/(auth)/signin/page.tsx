import { Metadata } from "next";
import { Suspense } from "react";
import SignInForm from "@/components/auth/SignInForm";

export const metadata: Metadata = {
  title: "Masuk | CMS Dahlia Group",
  description: "Halaman masuk CMS Dahlia Group",
};

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <Suspense>
        <SignInForm />
      </Suspense>
    </div>
  );
}
