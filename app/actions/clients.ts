"use server";
import { Client } from "@/interfaces";
import supabase from "../config/supabase-config";
const PAGE_SIZE = 10;
export const getlinksByClient = async (
  searchterm: string,
  page: number
): Promise<{ data: Client[]; total_records: number }> => {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  let query = supabase
    .from("clients")
    .select("*", { count: "exact" })
    .range(from, to);

  if (searchterm) {
    query = query.ilike("NMS_USER_LABEL", `%${searchterm}%`);
  }

  const { data, count, error } = await query;
  if (error || data.length === 0) throw error || new Error("No Links found");

  return { data, total_records: count! };
};

export const getAllClientLinks = async (page: number, limit: number) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  try {
    const { data, error, count } = await supabase
      .from("clients")
      .select("*", { count: "exact" })
      .range(from, to)
      .order("id", { ascending: true });

    if (error || data.length === 0)
      throw error || new Error("Client not found in dB");
    return {
      success: true,
      data: data,
      count: count,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const getlinkById = async (linkId: number) => {
  try {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("id", linkId);
    if (error || data.length === 0) throw error || new Error("Link not found");
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

export const getTicketFormClients = async (
  serviceType: string,
  acc_region: string
) => {
  try {
    const { data, error } = await supabase
      .from("clients")
      .select("id,Client", { count: "exact" })
      .neq("NMS_USER_LABEL", null)
      .eq("ServiceType", serviceType)
      .eq("Acc_Region", acc_region)
      .order("Client", { ascending: true });

    if (error || data.length === 0) {
      throw error || new Error("No Records Found");
    }

    const uniqueRows = Array.from(
      new Map(data.map((item) => [item.Client, item])).values()
    );
    return uniqueRows;
  } catch (e: any) {
    return {
      success: false,
      message: e.message,
    };
  }
};

export const getTicketFormLinks = async (
  serviceType: string,
  acc_region: string
) => {
  try {
    const { data, error } = await supabase
      .from("clients")
      .select("id,NMS_USER_LABEL", { count: "exact" })
      .neq("NMS_USER_LABEL", null)
      .eq("ServiceType", serviceType)
      .eq("Acc_Region", acc_region)
      .order("NMS_USER_LABEL", { ascending: true });

    if (error || data.length === 0) {
      throw error || new Error("No Records Found");
    }

    const uniqueRows = Array.from(
      new Map(data.map((item) => [item.NMS_USER_LABEL, item])).values()
    );
    return uniqueRows;
  } catch (e: any) {
    return {
      success: false,
      message: e.message,
    };
  }
};
