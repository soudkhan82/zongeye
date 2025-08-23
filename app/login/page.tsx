// app/login/page.tsx (or your current path)
"use client";

import React from "react";
import Image from "next/image";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Link from "next/link";
import toast from "react-hot-toast";
import { loginuser } from "../actions/users";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { Mail, Lock, ChevronRight } from "lucide-react";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["user", "admin", "vendor"]),
});

function LoginPage() {
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "", role: "vendor" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);
      const response = await loginuser(values);
      if (response.success) {
        toast.success("Logged In Successfully");
        Cookies.set("token", response.data ?? "undefined");

        if (values.role === "vendor") {
          router.push("/vendor/SAR");
        } else {
          router.push("/home");
        }
      } else {
        toast.error(response?.message ?? "Login failed");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen grid lg:grid-cols-2 bg-slate-950 text-slate-100 overflow-hidden">
      {/* Ambient gradient blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-[28rem] w-[28rem] rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background:radial-gradient(60rem_30rem_at_20%_-10%,#60a5fa,transparent),radial-gradient(50rem_30rem_at_110%_110%,#10b981,transparent)]" />

      {/* Brand / Hero (left) */}
      <section className="relative hidden lg:flex items-center justify-center p-10">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto mb-6 w-52 h-52 relative rounded-full overflow-hidden ring-2 ring-white/20 shadow-2xl">
            <Image
              src="/zongeye.png"
              alt="ZongEye"
              fill
              sizes="208px"
              className="object-contain drop-shadow-xl"
              priority
            />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">ZongEye</h1>
          <p className="mt-3 text-slate-300">
            Integrated analytics for Performance Metrices, Network Availability,
            complaints, with Intuitive & Interactive geographical maps
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3 text-xs text-slate-300">
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              Map-first dashboards
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              Role-based access
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              Next.js + shadcn/ui
            </div>
          </div>
        </div>
      </section>

      {/* Auth Card (right) */}
      <section className="relative flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          {/* Glow frame */}
          <div className="relative group">
            <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-br from-indigo-500 via-sky-500 to-emerald-500 opacity-70 blur group-hover:opacity-100 transition-opacity" />
            <div className="relative rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur-xl shadow-2xl p-6">
              {/* Small logo + title */}
              <div className="mb-4 flex items-center gap-3">
                <div className="relative h-12 w-12 rounded-full overflow-hidden ring-1 ring-white/20">
                  <Image
                    src="/zongeye.png"
                    alt="ZongEye"
                    fill
                    sizes="48px"
                    className="object-contain"
                  />
                </div>
                <div>
                  <div className="text-base font-semibold leading-5">
                    Login to your account
                  </div>
                  <div className="text-xs text-slate-400">
                    Welcome back — let’s get you in.
                  </div>
                </div>
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                            <Input
                              {...field}
                              type="email"
                              placeholder="xyz@zong.com.pk"
                              className="pl-9 bg-slate-950/40 border-white/10 focus-visible:ring-sky-400"
                              autoComplete="email"
                            />
                          </div>
                        </FormControl>
                        <FormDescription className="text-slate-400">
                          Use your corporate email.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Password */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                            <Input
                              {...field}
                              type="password"
                              placeholder="••••••••"
                              className="pl-9 bg-slate-950/40 border-white/10 focus-visible:ring-sky-400"
                              autoComplete="current-password"
                            />
                          </div>
                        </FormControl>
                        <FormDescription className="text-slate-400">
                          Minimum 8 characters.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Role */}
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex gap-6"
                          >
                            <FormItem className="flex items-center gap-2">
                              <FormControl>
                                <RadioGroupItem value="vendor" />
                              </FormControl>
                              <FormLabel className="font-normal text-slate-300">
                                Vendor
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center gap-2">
                              <FormControl>
                                <RadioGroupItem value="user" />
                              </FormControl>
                              <FormLabel className="font-normal text-slate-300">
                                User
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center gap-2">
                              <FormControl>
                                <RadioGroupItem value="admin" />
                              </FormControl>
                              <FormLabel className="font-normal text-slate-300">
                                Admin
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-4 pt-2">
                    <div className="text-sm text-slate-400">
                      Don’t have an account?{" "}
                      <Link
                        href="/register"
                        className="text-sky-400 hover:underline"
                      >
                        Register
                      </Link>
                    </div>
                    <Button
                      type="submit"
                      className="group bg-sky-500 hover:bg-sky-600 text-white shadow-lg"
                      disabled={loading}
                    >
                      {loading ? "Signing in..." : "Submit"}
                      <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} ZongEye. All rights reserved.
          </p>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
