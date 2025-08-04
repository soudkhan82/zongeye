"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { getPostById } from "@/app/actions/blog";
import { BlogPost } from "@/interfaces";

export default function EditPostPage() {
  const { id } = useParams() as { id: string };
  const [post, setPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    getPostById(id).then(({ data }) => setPost(data));
  }, [id]);

  if (!post) return <p>Loading...</p>;

  return <div className="max-w-xl mx-auto mt-10"></div>;
}
