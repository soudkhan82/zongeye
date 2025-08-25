// middleware.ts
import { NextResponse, NextRequest } from "next/server";

// Decode base64url JWT payload and return exp (in seconds) if present
function getJwtExp(token: string): number | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;

    // base64url → base64 with padding
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "===".slice((base64.length + 3) % 4);

    // Handle unicode safely
    const json = JSON.parse(
      decodeURIComponent(
        atob(padded)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      )
    );
    return typeof json?.exp === "number" ? json.exp : null;
  } catch {
    return null; // invalid token format
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  // Helper: redirect to /login and clear cookie
  const redirectToLogin = () => {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const res = NextResponse.redirect(url);
    res.cookies.delete("token");
    return res;
  };

  // No token → login
  if (!token) return redirectToLogin();

  // Expired/invalid token → login
  const exp = getJwtExp(token); // seconds since epoch
  if (!exp || exp * 1000 <= Date.now()) return redirectToLogin();

  // Token is present and not expired → proceed
  return NextResponse.next();
}

// Only run on protected routes
export const config = {
  matcher: [
    "/home/:path*",
    "/ssl/:path*",
    "/rt/:path*",
    "/tasks/:path*",
    "/avail/:path*",
    "/complaints/:path*",
    "/blog/:path*",
  ],
};
