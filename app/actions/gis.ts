"use server";

import { GeoPoint } from "@/interfaces";
import supabase from "../config/supabase-config";
const PAGE_SIZE = 8;
export const getAllpoints = async (
  searchterm: string,
  searchArea: string,
  page: number
): Promise<{
  data: GeoPoint[];
  total_records: number;
}> => {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  let query = supabase
    .from("ssl")
    .select("*", { count: "exact" })
    .order("Name", { ascending: true })
    .range(from, to);

  if (searchterm) {
    query = query.ilike("Name", `${searchterm}%`);
  }
  if (searchArea) {
    query = query.ilike("District", `%${searchArea}%`);
  }

  const { data, count, error } = await query;
  if (error || data.length === 0) throw error || new Error("No Records");

  return { data: data, total_records: count! };
};

//KPI fetching

export async function getLatestPoints(subregion?: string, district?: string) {
  const { data, error } = await supabase.rpc("fetch_latest_kpi_points", {
    p_subregion: subregion || null,
    p_district: district || null,
  });

  if (error) throw error;
  return data ?? [];
}
