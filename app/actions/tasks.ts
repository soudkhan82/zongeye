"use server";
import { ActionItem } from "@/interfaces";
import supabase from "../config/supabase-config";
const PAGE_SIZE = 5;
export const createNewActionItem = async (payload: any) => {
  try {
    const { error } = await supabase.from("actions").insert(payload);

    if (error) throw error;
    return {
      success: true,
      message: "Ticket Successfully created",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const getActionById = async (id: number) => {
  try {
    const { data, error } = await supabase
      .from("actions")
      .select("*")
      .eq("id", id);
    if (error || data.length === 0)
      throw error || new Error("Ticket not Found");
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
export const editActionByid = async ({
  action_id,
  payload,
}: {
  action_id: number;
  payload: any;
}) => {
  try {
    const { data, error } = await supabase
      .from("actions")
      .update(payload)
      .eq("id", action_id);
    if (error) throw error;

    return {
      success: true,
      message: "Action item updated successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
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
    .order("target_timeline", { ascending: true })
    .range(from, to);

  if (searchterm) {
    query = query.ilike("title", `%${searchterm}%`);
  }
  const { data, count, error } = await query;
  if (error || data.length === 0) throw error || new Error("No Records");
  return { data: data, total_records: count! };
};
