"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Menampilkan pesan dari `?success=...` (dikirim form setelah menyimpan),
 * lalu menghapusnya dari URL supaya tidak muncul lagi saat halaman dimuat ulang.
 */
export default function FlashMessage() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const value = searchParams.get("success");
    if (!value) return;

    setMessage(value);
    setVisible(true);

    const url = new URL(window.location.href);
    url.searchParams.delete("success");
    window.history.replaceState({}, "", url.toString());

    const hide = setTimeout(() => setVisible(false), 3000);
    const clear = setTimeout(() => setMessage(""), 4000);

    return () => {
      clearTimeout(hide);
      clearTimeout(clear);
    };
  }, [searchParams]);

  if (!message) return null;

  return (
    <div
      className={`rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 transition-all duration-500 dark:bg-green-500/10 dark:text-green-400 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {message}
    </div>
  );
}
