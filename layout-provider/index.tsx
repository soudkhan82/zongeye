"use client";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import PrivateLayout from "./PrivateLayout";
import PublicLayout from "./PublicLayout";

function LayoutProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPrivate =
    pathname.startsWith("/corporate") ||
    pathname.startsWith("/task") ||
    pathname.startsWith("/vendor");

  if (isPrivate) {
    return <PrivateLayout>{children}</PrivateLayout>;
  } else {
    return <PublicLayout>{children}</PublicLayout>;
  }
}
export default LayoutProvider;
