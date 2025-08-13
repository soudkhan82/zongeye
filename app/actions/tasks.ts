"use server";
import {
  ActionItem,
  ActionTypeCount,
  NewActionItem,
  RegionCount,
  StatusCount,
  UpdateActionItem,
} from "@/interfaces";
import supabase from "../config/supabase-config";

const PAGE_SIZE = 5;
export const createNewActionItem = async (payload: NewActionItem) => {
  const { error } = await supabase.from("actions").insert(payload);

  if (error) throw error;
  return {
    success: true,
    message: "Task Successfully created",
  };
};

export const getActionById = async (id: number) => {
  const { data, error } = await supabase
    .from("actions")
    .select("*")
    .eq("id", id);
  if (error || data.length === 0) throw error || new Error("Ticket not Found");
  return {
    success: true,
    data: data[0],
    message: "Successful",
  };
};

export const editActionByid = async ({
  action_id,
  payload,
}: {
  action_id: number;
  payload: UpdateActionItem;
}) => {
  const { error } = await supabase
    .from("actions")
    .update(payload)
    .eq("id", action_id);

  if (error) throw error;
  return {
    success: true,
    message: "Ticket updated successfully",
  };
};

export const getActionsAll = async (
  searchterm: string,
  page: number
): Promise<{ data: ActionItem[]; total_records: number }> => {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  let query = supabase
    .from("actions")
    .select("*", { count: "exact" })
    .neq("status", "Closed")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (searchterm) {
    query = query.ilike("title", `%${searchterm}%`);
  }
  const { data, count, error } = await query;
  if (error || data.length === 0) throw error || new Error("No Records");
  return { data: data, total_records: count! };
};

export async function getActionsByRegion(): Promise<RegionCount[] | null> {
  const { data, error } = await supabase.rpc("group_actions_by_region");

  if (error) {
    console.error("❌ Failed to fetch grouped actions:", error);
    return null;
  }
  if (!Array.isArray(data)) {
    console.error("⚠️ RPC result is not an array:", data);
    return null;
  }
  return data;
}

export async function getActionsByType(): Promise<ActionTypeCount[] | null> {
  const { data, error } = await supabase.rpc("grouped_actions_by_type");

  if (error) {
    console.error("❌ Failed to fetch grouped actions:", error);
    return null;
  }
  if (!Array.isArray(data)) {
    console.error("⚠️ RPC result is not an array:", data);
    return null;
  }
  return data;
}

export async function getActionsByStatus(): Promise<StatusCount[] | null> {
  const { data, error } = await supabase.rpc("grouped_actions_by_status");

  if (error) {
    console.error("❌ RPC error:", error);
    return null;
  }

  if (!Array.isArray(data)) {
    console.error("⚠️ RPC result is not an array:", data);
    return null;
  }

  return data;
}

export async function getAllActions(): Promise<ActionItem[] | null> {
  const { data, error } = await supabase
    .from("actions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Failed to fetch actions:", error);
    return null;
  }

  return data;
}

type UploadResult =
  | { success: true; url: string; path: string }
  | { success: false; message: string };

type UploadOpts = {
  bucket?: string; // default: "action-images"
  prefix?: string; // optional folder prefix
  upsert?: boolean; // default: false
  cacheControl?: string; // default: "3600"
};

export async function uploadImage(
  file: File,
  opts: UploadOpts = {}
): Promise<UploadResult> {
  try {
    if (!file || file.size === 0) {
      return { success: false, message: "No file provided" };
    }

    const bucket = opts.bucket ?? "blog-images";
    const prefix = opts.prefix
      ? opts.prefix.replace(/^\/+|\/+$/g, "") + "/"
      : "";
    const upsert = opts.upsert ?? false;
    const cacheControl = opts.cacheControl ?? "3600";

    // Create a user-scoped server client (respects RLS via cookies)

    // Build a unique storage path
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const name = `action_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;
    const path = `${prefix}${name}`;

    // Upload the File (Server Actions natively support File/Blob)
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl,
        upsert,
        contentType: file.type || undefined,
      });

    if (error) return { success: false, message: error.message };

    const { data: pub } = await supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);
    return { success: true, url: pub.publicUrl, path: data.path };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Upload failed";
    return { success: false, message: msg };
  }
}
