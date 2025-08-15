"use client";

import React from "react";
import Cookies from "js-cookie";
import { useRouter, usePathname } from "next/navigation";
import toast from "react-hot-toast";
import {
  ChartPie,
  FileDown,
  Map as MapIcon,
  MapPinHouseIcon,
  Network,
  Newspaper,
  SquareCheckBig,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import userGlobalStore, {
  IUsersGlobalStore,
} from "../store/users-global-store";
import NextImage from "next/image";
type NavItem = {
  title: string;
  route: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

interface MenuItemsProps {
  openMenuItems: boolean;
  setOpenMenuItems: (openMenuItems: boolean) => void;
  /** Height of your top snack/app bar in px; panel will start below it */
  topOffset?: number; // default 64
}

function MenuItems({
  openMenuItems,
  setOpenMenuItems,
  topOffset = 64,
}: MenuItemsProps) {
  const { user } = userGlobalStore() as IUsersGlobalStore;
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = React.useState("");

  const onLogout = () => {
    try {
      Cookies.remove("token");
      Cookies.remove("role");
      router.push("/login");
      toast.success("Logged out successfully");
    } catch {
      toast.error("An error occurred while logging out");
    }
  };

  const baseItems: NavItem[] = [
    { title: "Home", route: "/home", icon: Network },
    { title: "Geographical Information Sys", route: "/ssl", icon: MapIcon },
    { title: "Traffic Analysis", route: "/traffic", icon: MapIcon },
    { title: "Live Network Dashboard", route: "/ssl/Dashboard", icon: MapIcon },
    { title: "Network Availability", route: "/avail", icon: Newspaper },
    { title: "Voice & Data Heatmaps", route: "/rt", icon: Newspaper },
    { title: "Action Items", route: "/tasks", icon: SquareCheckBig },
    { title: "Network Achievements", route: "/blog", icon: Newspaper },
    { title: "Site Access Requests", route: "/vendor/SAR", icon: FileDown },
  ];

  const vendorItems: NavItem[] = [
    {
      title: "Site Access Requests",
      route: "/vendor/SAR/Dashboard",
      icon: ChartPie,
    },
    {
      title: "Add Site Access Request",
      route: "/vendor/SAR/add",
      icon: MapPinHouseIcon,
    },
  ];

  const itemsToRender =
    user?.role === "user" || user?.role === "admin" ? baseItems : vendorItems;

  const filtered = React.useMemo(
    () =>
      itemsToRender.filter((i) =>
        i.title.toLowerCase().includes(query.trim().toLowerCase())
      ),
    [itemsToRender, query]
  );

  const handleNavigate = (route: string) => {
    if (pathname === route) {
      setOpenMenuItems(false);
      return;
    }
    router.push(route);
    setOpenMenuItems(false);
  };

  return (
    <Sheet open={openMenuItems} onOpenChange={setOpenMenuItems}>
      {/* RIGHT side + offset below your top bar */}
      <SheetContent
        side="right"
        className="w-80 sm:w-96 p-0 border-l shadow-xl rounded-tl-2xl overflow-hidden"
        style={{
          top: topOffset, // start below snack/app bar
          height: `calc(100% - ${topOffset}px)`, // fill remaining height
        }}
      >
        {/* Brand / Header */}
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-sky-500 text-white px-6 py-6">
          <SheetHeader className="flex-row items-center gap-4 space-y-0">
            {/* Circular logo */}
            <div className="relative h-30 w-30 rounded-full overflow-hidden ring-2 ring-white/70 shadow-md shrink-0">
              <NextImage
                src="/zongeye.png"
                alt="Zong Eye"
                fill
                priority
                className="object-cover"
                sizes="80px"
              />
            </div>

            {/* Description next to image */}
            <SheetDescription className="text-sky-100 text-sm leading-5 m-0">
              Quick access to analytics & tools
            </SheetDescription>
          </SheetHeader>

          {user?.name && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-300" />
              <span className="truncate max-w-[14rem]">{user.name}</span>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="px-6 pt-4">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search menu..."
            className="bg-white dark:bg-neutral-900"
          />
        </div>

        {/* Nav list */}
        <nav className="px-3 py-4">
          <ul className="space-y-1">
            {filtered.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.route;
              return (
                <li key={item.route}>
                  <button
                    type="button"
                    aria-current={active ? "page" : undefined}
                    onClick={() => handleNavigate(item.route)}
                    className={[
                      "group w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60",
                      active
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-200 ring-1 ring-indigo-200"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-neutral-800",
                      "relative",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "absolute left-0 top-1/2 -translate-y-1/2 h-7 w-1 rounded-r",
                        active
                          ? "bg-indigo-500"
                          : "bg-transparent group-hover:bg-gray-300",
                      ].join(" ")}
                    />
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-gray-200 group-hover:ring-gray-300 dark:bg-neutral-900 dark:ring-neutral-700">
                      <Icon
                        size={16}
                        className={
                          active
                            ? "text-indigo-600"
                            : "text-gray-600 dark:text-gray-300"
                        }
                      />
                    </span>
                    <span className="truncate">{item.title}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer actions */}
        <div className="mt-auto px-6 pb-6">
          <div className="rounded-xl border border-gray-200 dark:border-neutral-800 p-3 bg-white dark:bg-neutral-900">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              You are signed in as
            </div>
            <div className="text-sm font-medium">
              {user?.name ?? "User"}{" "}
              <span className="text-gray-400">({user?.role ?? "guest"})</span>
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => toast("Preferences coming soon")}
              >
                Preferences
              </Button>
              <Button className="w-full" onClick={onLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default MenuItems;
