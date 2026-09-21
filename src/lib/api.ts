type DashboardArticle = { id: number; title: string; created_at?: string };

/**
 * Dipakai dashboard (komponen server). Respons dibaca sebagai teks dulu baru
 * di-parse, supaya kalau yang datang HTML (halaman error Nginx/Cloudflare) atau
 * koneksinya terputus, log Vercel mencatat status, header asal, dan potongan
 * isinya — bukan sekadar "Unexpected token '<'". Dashboard tampil kosong alih-alih
 * menampilkan halaman error.
 */
export async function fetchArticles(token?: string): Promise<DashboardArticle[]> {
  const path = "/article";

  let res: Response;
  try {
    res = await fetch(`https://backend.ptdahliaglobalindo.id${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store",
    });
  } catch (err) {
    const cause = (err as { cause?: { code?: string; message?: string } })?.cause;
    console.error(`[backend] ${path} gagal terhubung:`, {
      message: (err as Error).message,
      cause: cause?.code || cause?.message,
    });
    return [];
  }

  let text = "";
  try {
    text = await res.text();
  } catch (err) {
    // Koneksi terputus di tengah pengiriman isi ("terminated")
    console.error(`[backend] ${path} terputus saat membaca isi:`, {
      status: res.status,
      server: res.headers.get("server"),
      cfRay: res.headers.get("cf-ray"),
      contentLength: res.headers.get("content-length"),
      message: (err as Error).message,
    });
    return [];
  }

  const describe = () => ({
    status: res.status,
    contentType: res.headers.get("content-type"),
    server: res.headers.get("server"),
    cfRay: res.headers.get("cf-ray"),
    bodyLength: text.length,
    body: text.slice(0, 300),
  });

  if (!res.ok) {
    console.error(`[backend] ${path} membalas error:`, describe());
    return [];
  }

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    console.error(`[backend] ${path} membalas bukan JSON:`, describe());
    return [];
  }

  // Backend mengirim array langsung; bentuk { data: [...] } ikut ditangani
  if (Array.isArray(data)) return data as DashboardArticle[];
  if (Array.isArray((data as { data?: unknown[] })?.data)) {
    return (data as { data: DashboardArticle[] }).data;
  }

  console.warn(`[backend] ${path} bentuk data tidak dikenali:`, describe());
  return [];
}

export async function fetchArticleBySlug(slug: string, token?: string) {
  const res = await fetch(`https://backend.ptdahliaglobalindo.id/article/${slug}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: "no-store",
  });
  const data = await res.json();
  return data;
}

// export async function fetchCategories(token?: string) {
//   const res = await fetch("https://backend.ptdahliaglobalindo.id/category", {
//     headers: token ? { Authorization: `Bearer ${token}` } : {},
//     cache: "no-store",
//   });
//   const data = await res.json();
//   return Array.isArray(data.data) ? data.data : data;
// }

export async function updateArticle(slug: string, formData: FormData, token?: string) {
  const res = await fetch(`https://backend.ptdahliaglobalindo.id/article/${slug}`, {
    method: "POST", // Use POST for FormData, backend should handle it as an update
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Gagal memperbarui artikel.");
  }

  return await res.json();
}