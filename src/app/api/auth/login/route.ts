import { NextResponse } from "next/server";
import { BACKEND_URL, TOKEN_COOKIE } from "@/lib/config";

export async function POST(request: Request) {
  const body = await request.json();

  const res = await fetch(`${BACKEND_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return NextResponse.json(
      { message: data?.message || "Login gagal" },
      { status: res.status }
    );
  }

  const response = NextResponse.json({ user: data?.data?.user ?? null });

  // Token disimpan httpOnly supaya tidak bisa dibaca JavaScript di browser
  response.cookies.set(TOKEN_COOKIE, data.data.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 hari, sama dengan masa berlaku token di backend
  });

  return response;
}
