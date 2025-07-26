import { NextResponse, NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  try {
    const route = request.nextUrl.pathname;
    const token = request.cookies.get("token")?.value;
    const isPrivate =
      route.startsWith("/corporate") || route.startsWith("/tasks");

    if (isPrivate && !token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (!isPrivate && token) {
      const role = request.cookies.get("role")?.value;
      return NextResponse.redirect(
        new URL(`/${role}/SAR/Dashboard`, request.url)
      );
    } else {
      NextResponse.next();
    }
  } catch (error) {
    return NextResponse.error();
  }
}
export const config = {
  matcher: ["/about/:path*", "/corporate/:path*"],
};
