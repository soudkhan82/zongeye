"use client";

import { useRouter } from "next/navigation";
import { BlogForm } from "../components/BlogForm";

import { BlogPost } from "@/interfaces";
import { createPost } from "@/app/actions/blog";

export default function NewPostPage() {
  const router = useRouter();

  const handleCreatePost = async (
    values: Omit<BlogPost, "id" | "created_at">,
    file: File | null
  ) => {
    console.log(values);
    const { error } = await createPost(values, file);
    if (!error) {
      router.push("/blog"); // Navigate back to blog list
    } else {
      console.error("Failed to create post:", error.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Create Blog Post</h1>
      <BlogForm
        mode="add"
        onSubmit={handleCreatePost}
        initialValues={undefined}
      />
    </div>
  );
}
