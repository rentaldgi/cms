import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { BACKEND_URL, TOKEN_COOKIE } from "@/lib/config";

/**
 * Penerus permintaan dari browser ke backend.
 *
 * Komponen client memanggil `/api/backend/<endpoint>`, lalu token login
 * ditempelkan di sini. Dengan begitu token tidak pernah menyentuh JavaScript
 * di browser, jadi tidak bisa dicuri lewat celah XSS.
 */
async function forward(request: Request, path: string[]) {
  const token = (await cookies()).get(TOKEN_COOKIE)?.value;
  const search = new URL(request.url).search;
  const url = `${BACKEND_URL}/${path.join("/")}${search}`;

  const headers = new Headers();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  const hasBody = !["GET", "HEAD"].includes(request.method);

  const res = await fetch(url, {
    method: request.method,
    headers,
    body: hasBody ? await request.arrayBuffer() : undefined,
    cache: "no-store",
  });

  // Token kedaluwarsa atau dicabut: browser diminta login ulang
  if (res.status === 401) {
    const response = NextResponse.json(
      { message: "Sesi berakhir, silakan login kembali" },
      { status: 401 }
    );
    response.cookies.delete(TOKEN_COOKIE);
    return response;
  }

  const bodyText = await res.text();

  return new NextResponse(bodyText, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") || "application/json",
    },
  });
}

type Context = { params: Promise<{ path: string[] }> };

export async function GET(request: Request, { params }: Context) {
  return forward(request, (await params).path);
}

export async function POST(request: Request, { params }: Context) {
  return forward(request, (await params).path);
}

export async function PUT(request: Request, { params }: Context) {
  return forward(request, (await params).path);
}

export async function DELETE(request: Request, { params }: Context) {
  return forward(request, (await params).path);
}
