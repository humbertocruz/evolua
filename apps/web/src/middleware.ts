import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Minimal auth check without importing NextAuth's heavy auth()
// Just checks for the session cookie set by NextAuth
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow auth routes
  if (pathname.startsWith("/auth/")) {
    return NextResponse.next();
  }

  // Allow public runtime routes (no auth needed)
  if (pathname.startsWith("/api/runtime/") || pathname.startsWith("/app/")) {
    return NextResponse.next();
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Protect /evolua/*
  if (pathname.startsWith("/evolua")) {
    // NextAuth session cookie name (v5 beta)
    const sessionCookie = request.cookies.get("authjs.session-token")
      || request.cookies.get("__Secure-authjs.session-token");

    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
