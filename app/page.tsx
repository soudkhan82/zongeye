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

  return (
    <div className="relative min-h-screen">
      <div className="auth-bg">
        <div className="bg-white p-5 rounded-sm w-[400px] max-w-full mx-auto mt-12 shadow-sm">
          <h1 className="font-bold">Login to your account</h1>
          <hr className="my-7 border-gray-300" />
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8 mt-5"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>Enter your Email</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormDescription>Enter your password</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-10"
                      >
                        <FormItem className="flex items-center gap-3">
                          <FormControl>
                            <RadioGroupItem value="vendor" />
                          </FormControl>
                          <FormLabel className="font-normal">Vendor</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center gap-3">
                          <FormControl>
                            <RadioGroupItem value="user" />
                          </FormControl>
                          <FormLabel className="font-normal">User</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center gap-3">
                          <FormControl>
                            <RadioGroupItem value="admin" />
                          </FormControl>
                          <FormLabel className="font-normal">Admin</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-between items-center">
                <div className="flex gap-2 text-sm">
                  Don’t have an account?{" "}
                  <Link href="/register" className="text-primary underline">
                    Register
                  </Link>
                </div>
                <Button type="submit" className="ml-5" disabled={loading}>
                  {loading ? "Signing in..." : "Submit"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
