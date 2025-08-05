import { notFound, redirect } from "next/navigation";

import { BlogPost } from "@/interfaces";
import { getPostById, updatePost } from "@/app/actions/blog";
import { BlogForm } from "../../components/BlogForm";

interface EditPostPageProps {
  params: {
    id: string;
  };
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const id = Number(params.id);

  // If ID is not a number, show 404
  if (isNaN(id)) {
    return notFound();
  }

  const post = await getPostById(id);

  if (!post) {
    return notFound();
  }

  const handleUpdatePost = async (
    values: Omit<BlogPost, "id" | "created_at">,
    file: File | null
  ) => {
    "use server";

    const { error } = await updatePost(id, values, file);

    if (!error) {
      redirect("/blog");
    } else {
      console.error("Update failed:", error.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Edit Blog Post</h1>
      <BlogForm
        mode="edit"
        onSubmit={handleUpdatePost}
        initialValues={{
          title: post.data.title,
          description: post.data.description,
          impact: post.data.impact,
          image: post.data.image,
        }}
      />
    </div>
  );
}
