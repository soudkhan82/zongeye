"use client";
import React from "react";
import Cookies from "js-cookie";
import userGlobalStore, {
  IUsersGlobalStore,
} from "../store/users-global-store";
import { useRouter, usePathname } from "next/navigation";

import toast from "react-hot-toast";
import {
  ChartPie,
  MailSearch,
  MapPinHouseIcon,
  SquareCheckBig,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface MenuItemsProps {
  openMenuItems: boolean;
  setOpenMenuItems: (openMenuItems: boolean) => void;
}

function MenuItems({ openMenuItems, setOpenMenuItems }: MenuItemsProps) {
  const { user } = userGlobalStore() as IUsersGlobalStore;
  const router = useRouter();
  const onLogout = () => {
    try {
      Cookies.remove("token");
      Cookies.remove("role");
      router.push("/login");
      toast.success("Logged out successfully");
    } catch (e) {
      toast.error("An Error has occured in Menu");
    }
  };
  const pathname = usePathname();
  let MenuItems = [
    {
      title: "Corporate Dashboard",
      route: "/corporate/dashboard",
      icon: <ChartPie size={14} />,
    },
    {
      title: "Corporate Tickets",
      route: "/corporate/tickets",
      icon: <SquareCheckBig size={14} />,
    },
    {
      title: "Add Ticket",
      route: "/corporate/tickets/add",
      icon: <MapPinHouseIcon size={14} />,
    },
    {
      title: "Corporate Clients",
      route: "/corporate/clients",
      icon: <MapPinHouseIcon size={14} />,
    },
    {
      title: "Action Items",
      route: "/tasks",
      icon: <SquareCheckBig size={14} />,
    },
    {
      title: "Site Access Requests",
      route: "/vendor/SAR",
      icon: <MailSearch size={14} />,
    },
  ];
  let VendorMenuItems = [
    {
      title: "Site Access Requests",
      route: "/vendor/SAR/Dashboard",
      icon: <ChartPie size={13} />,
    },

    {
      title: "Add Site Access Request",
      route: "/vendor/SAR/add",
      icon: <MapPinHouseIcon size={13} />,
    },
  ];
  const menuItemsToRender =
    user?.role === "user" || user?.role === "admin"
      ? MenuItems
      : VendorMenuItems;

  return (
    <Sheet open={openMenuItems} onOpenChange={setOpenMenuItems}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Navigation Plane</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-7 mt-20 justify-center">
          {menuItemsToRender.map((menuItem, index) => (
            <div
              className={`flex gap-5 items-center p-2 cursor-pointer
            ${
              pathname === menuItem.route
                ? "bg-gray-100 border border-gray-500"
                : "text-gray-500"
            }`}
              key={index}
              onClick={() => {
                router.push(menuItem.route);
                setOpenMenuItems(false);
              }}
            >
              <div className="text-black">{menuItem.icon}</div>
              <span className="text-sm text-black">{menuItem.title}</span>
            </div>
          ))}
          <Button onClick={onLogout}>Logout</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default MenuItems;
