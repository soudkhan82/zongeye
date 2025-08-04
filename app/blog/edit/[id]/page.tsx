import { useEffect, useState } from "react";

import { getPostById } from "@/app/actions/blog";
import { BlogPost } from "@/interfaces";

interface Props {
  params: Promise<{ id: number }>;
}
async function EditPostPage({ params }: Props) {
  const { id } = await params;
  const response = await getPostById(id);
  const post: BlogPost = response.data;

  if (!post) return <p>Loading...</p>;

  return <div className="max-w-xl mx-auto mt-10"></div>;
}

export default EditPostPage;
