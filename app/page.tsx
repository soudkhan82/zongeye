"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { loginuser } from "./actions/users";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import userGlobalStore, {
  IUsersGlobalStore,
} from "../store/users-global-store";
import type { IUser } from "../interfaces";

// If your login function’s return shape differs, tweak this:
type LoginResponse = {
  success: boolean;
  data?: string; // token
  user?: IUser; // full user row from DB
  message?: string;
};

function LandingPage() {
  const [loading, setLoading] = React.useState(false);
  const [sessionChecked, setSessionChecked] = React.useState(false);
  const router = useRouter();
  const { user, setUser } = userGlobalStore() as IUsersGlobalStore;

  const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(["user", "admin", "vendor"]),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "", role: "vendor" },
  });

  // Rehydrate + redirect if already logged in
  React.useEffect(() => {
    try {
      if (!user) {
        const saved = localStorage.getItem("app_user");
        if (saved) setUser(JSON.parse(saved) as IUser);
      }
    } catch {}
    const token = Cookies.get("token");
    if (user || token) {
      router.replace("/home");
      setSessionChecked(true);
      return;
    }
    setSessionChecked(true);
  }, [router, user, setUser]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);
      const res = (await loginuser(values)) as LoginResponse;

      if (!res?.success) {
        toast.error(res?.message ?? "Login failed");
        return;
      }

      // Token
      if (res.data) Cookies.set("token", res.data);

      // User (sanitize password before storing!)
      if (res.user) {
        const safeUser: IUser = { ...res.user, password: "" };
        setUser(safeUser);
        try {
          localStorage.setItem("app_user", JSON.stringify(safeUser));
        } catch {}
      } else {
        // If your API doesn’t return user, remove this block and always return it server-side.
        const fallback: IUser = {
          id: -1,
          name: values.email.split("@")[0],
          email: values.email,
          password: "",
          role: values.role,
          isactive: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setUser(fallback);
        try {
          localStorage.setItem("app_user", JSON.stringify(fallback));
        } catch {}
      }

      toast.success("Logged In Successfully");
      if (values.role === "vendor") router.push("/vendor/SAR");
      else router.push("/home");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  if (!sessionChecked) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-sm text-gray-500">Checking session…</div>
      </div>
    );
  }

  return <div className="relative min-h-screen"></div>;
}

export default LandingPage;
