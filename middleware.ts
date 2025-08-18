import { NextResponse, NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  try {
    const route = request.nextUrl.pathname;
    const token = request.cookies.get("token")?.value;

    // Define private routes/folders
    const isPrivate =
      route.startsWith("/corporate") ||
      route.startsWith("/tasks") ||
      route.startsWith("/home") ||
      route.startsWith("/rt") ||
      route.startsWith("/ssl");

    // If visiting a private route without a token → redirect to login
    if (isPrivate && !token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // If visiting a public route while logged in → redirect to role dashboard
    if (!isPrivate && token) {
      const role = request.cookies.get("role")?.value ?? "user"; // fallback
      return NextResponse.redirect(
        new URL(`/${role}/SAR/Dashboard`, request.url)
      );
    }

    // Otherwise, just continue
    return NextResponse.next();
  } catch (error) {
    return NextResponse.error();
  }
}

// Match ALL routes except Next.js internals/static files
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
