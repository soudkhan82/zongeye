// middleware.ts
import { NextResponse, NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

// Only run on protected routes (ignores images/static by default)
export const config = {
  matcher: [
    "/home/:path*",
    "/ssl/:path*",
    "/rt/:path*",
    "/tasks/:path*",
    "/corporate/:path*",
  ],
};
