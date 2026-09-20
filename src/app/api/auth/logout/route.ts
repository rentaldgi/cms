import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { BACKEND_URL, TOKEN_COOKIE } from "@/lib/config";

export async function POST() {
  const token = (await cookies()).get(TOKEN_COOKIE)?.value;

  if (token) {
    // Token dicabut di backend, bukan sekadar dihapus dari browser
    await fetch(`${BACKEND_URL}/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => null);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete(TOKEN_COOKIE);

  return response;
}
