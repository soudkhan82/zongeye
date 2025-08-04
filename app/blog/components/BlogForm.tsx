"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const blogSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  impact: z.string().min(1, "Impact is required"),
  image: z.string().optional(),
});

type BlogFormValues = z.infer<typeof blogSchema>;

interface BlogFormProps {
  initialValues?: Partial<BlogFormValues>;
  onSubmit: (data: BlogFormValues, file: File | null) => void;
  mode: "add" | "edit";
}

export function BlogForm({ initialValues, onSubmit, mode }: BlogFormProps) {
  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogSchema),
    defaultValues: initialValues ?? {
      title: "",
      description: "",
      impact: "",
      image: "",
    },
  });

  const [file, setFile] = useState<File | null>(null);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => onSubmit(values, file))}
        className="space-y-6 max-w-xl mx-auto"
      >
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Write the description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Impact */}
        <FormField
          control={form.control}
          name="impact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Impact</FormLabel>
              <FormControl>
                <Input placeholder="Enter impact" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* File Upload */}
        <FormItem>
          <FormLabel>Upload Image</FormLabel>
          <FormControl>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </FormControl>
          {file && (
            <p className="text-sm text-muted-foreground">
              Selected: {file.name}
            </p>
          )}
        </FormItem>

        {/* Submit Button */}
        <Button type="submit" className="w-full">
          {mode === "add" ? "Add Post" : "Update Post"}
        </Button>
      </form>
    </Form>
  );
}
