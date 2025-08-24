// app/(auth)/login/page.tsx (or wherever this component lives)
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function LandingPage() {
  const router = useRouter();
  const [redirecting, setRedirecting] = React.useState(true);

  React.useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      setRedirecting(true);
      router.replace("/home");
    } else {
      router.replace("/login");
    }
  }, [router]);

  if (redirecting) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-sm text-gray-500">Checking session…</div>
      </div>
    );
  }

  // No UI if not redirecting; keep page minimal
  return <div className="min-h-screen" />;
}
