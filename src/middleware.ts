import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { TOKEN_COOKIE } from "@/lib/config";

/**
 * Semua halaman CMS wajib login. Tanpa cookie token, pengunjung dilempar
 * ke /signin, dan setelah login dikembalikan ke halaman yang dituju.
 */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isLoggedIn = Boolean(request.cookies.get(TOKEN_COOKIE)?.value);

  if (pathname === "/signin") {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    const loginUrl = new URL("/signin", request.url);
    loginUrl.searchParams.set("next", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Hanya halaman. Route handler di /api mengurus auth-nya sendiri:
    // proxy membalas 401 supaya browser tidak menerima HTML halaman login.
    "/((?!api|_next/static|_next/image|favicon.ico|images|.*\.svg$).*)",
  ],
};
