import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Allow auth routes
  if (pathname.startsWith("/auth/")) {
    return NextResponse.next();
  }

  // Protect /evolua/*
  if (pathname.startsWith("/evolua")) {
    if (!req.auth) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/evolua/:path*"],
};
