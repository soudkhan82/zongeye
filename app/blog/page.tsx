"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { deletePost, getPosts } from "../actions/blog";
import { BlogPost } from "@/interfaces";

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    getPosts().then(({ data }) => setPosts(data ?? []));
  }, []);

  const handleDelete = async (id: number) => {
    await deletePost(id);
    setPosts(posts.filter((p) => p.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <Link href="/blog/new">
        <Button>Add Post</Button>
      </Link>
      {posts.map((post) => (
        <div key={post.id} className="border p-4 rounded-md shadow">
          <h2 className="text-xl font-bold">{post.title}</h2>
          <p>{post.description}</p>
          <p>
            <strong>Impact:</strong> {post.impact}
          </p>
          {post.image && <img src={post.image} alt="" className="w-128 mt-2" />}

          <div className="mt-2 flex gap-2">
            <Link href={`/blog/edit/${post.id}`}>
              <Button>Edit</Button>
            </Link>
            <Link href={`/blog/details/${post.id}`}>
              <Button>Details</Button>
            </Link>
            <Button variant="destructive" onClick={() => handleDelete(post.id)}>
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
