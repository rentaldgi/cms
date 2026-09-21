import { useEffect, useState } from "react";

/**
 * Nilai yang baru ikut berubah setelah pengguna berhenti mengetik selama
 * `delay` ms. Dipakai kolom cari supaya backend tidak dipanggil tiap huruf.
 */
export function useDebouncedValue<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
