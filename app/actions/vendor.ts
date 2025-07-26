"use server";
import { SiteAccessRequest } from "@/interfaces";
import supabase from "../config/supabase-config";

const PAGE_SIZE = 5;

export const createNewSiteAccessRequest = async (payload: any) => {
  try {
    const { error } = await supabase.from("sar").insert(payload);
    if (error) throw error;

    return {
      success: true,
      message: "Request Successfully submitted",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const getSiteAccessRequestById = async (id: number) => {
  try {
    const { data, error } = await supabase.from("sar").select("*").eq("id", id);

    if (error || data.length === 0)
      throw error || new Error("Request not found");
    return {
      success: true,
      data: data[0],
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const editSARById = async ({
  request_id,
  payload,
}: {
  request_id: number;
  payload: any;
}) => {
  try {
    const { data, error } = await supabase
      .from("sar")
      .update(payload)
      .eq("id", request_id);
    if (error) throw error;
    return {
      success: true,
      message: "Request updated successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const getSiteAccessRequestAll = async (
  searchterm: string,
  page: number
): Promise<{ data: SiteAccessRequest[]; total_records: number }> => {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  let query = supabase
    .from("sar")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (searchterm) {
    query = query.ilike("title", `%${searchterm}%`);
  }
  const { data, count, error } = await query;
  if (error || data.length === 0) throw error || new Error("No Records");
  return { data: data, total_records: count! };
};
