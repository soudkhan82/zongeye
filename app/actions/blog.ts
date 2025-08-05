"use server";
import { BlogPost } from "@/interfaces";
import supabase from "../config/supabase-config";

type BlogInput = Omit<BlogPost, "id" | "created_at">;

export async function createPost(
  post: BlogInput,
  file: File | null
): Promise<{ error: Error | null }> {
  try {
    let imageUrl = "";
    if (file) {
      const { data, error } = await supabase.storage
        .from("blog-images")
        .upload(`public/${Date.now()}-${file.name}`, file);
      if (error) {
        console.error("Image error", error);
        return { error };
      }

      imageUrl = supabase.storage.from("blog-images").getPublicUrl(data.path)
        .data.publicUrl;
    }

    const { error: insertError } = await supabase
      .from("posts")
      .insert([{ ...post, image: imageUrl }]);
    if (insertError) {
      console.error("Insert Error", insertError);
      return { error: insertError };
    }
    return { error: null };
  } catch (error) {
    console.error("Unexpected error in createPost:", error);
    return { error: new Error("Unexpected error") };
  }
}

export async function updatePost(
  id: number,
  post: BlogInput,
  file?: File | null
): Promise<{ error: Error | null }> {
  try {
    let imageUrl = post.image;
    if (file) {
      const { data, error } = await supabase.storage
        .from("blog-images")
        .upload(`public/${Date.now()}-${file.name}`, file);
      if (error) throw error;
      imageUrl = supabase.storage.from("blog-images").getPublicUrl(data.path)
        .data.publicUrl;
    }
    const { error } = await supabase
      .from("posts")
      .update({ ...post, image: imageUrl })
      .eq("id", id);
    if (error) {
      console.error("Insert error:", error);
    }

    return { error };
  } catch (error) {
    console.error("Unexpected error in createPost:", error);
    return { error: new Error("Unexpected error") };
  }
}

export async function getPosts() {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });
  return { data, error };
}

export async function getPostById(id: number) {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();
  return { data, error };
}

export async function deletePost(id: number) {
  const { error } = await supabase.from("posts").delete().eq("id", id);
  return { error };
}
