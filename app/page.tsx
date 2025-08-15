"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import GeoBackground from "./components/geobackground";
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
function LandingPage() {
  const [loading, setloading] = React.useState(false);
  const router = useRouter();
  const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(["user", "admin", "vendor"]),
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "vendor",
    },
  });
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.

    try {
      setloading(true);
      const response = await loginuser(values);
      if (response.success) {
        console.log(values);

        toast.success("Logged In Successfully");
        Cookies.set("token", response.data ?? "undefined");

        if (values.role === "vendor") {
          router.push("/vendor/SAR");
        } else {
          router.push("/home");
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        return { success: false as const, message: err.message };
      }
    } finally {
      setloading(false);
    }
  }

  return (
    <div className="relative min-h-screen">
      <div className="auth-bg">
        <div className="bg-white p-5 rounded-sm-w-[400px]">
          <h1 className="font-bold">Login to your acount</h1>

          <hr className="my-7 border-gray-300"></hr>
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
                      <Input placeholder="" {...field} />
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
                      <Input placeholder="" {...field} type="password" />
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
                          <FormLabel className="font-normal">vendor</FormLabel>
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
                <div className="flex gap-22">
                  Dont have an account? <Link href="/register">Register</Link>
                </div>
                <Button type="submit" className="ml-5" disabled={loading}>
                  Submit
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
