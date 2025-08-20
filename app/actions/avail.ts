"use server";
import supabase from "../config/supabase-config";

export async function getAvailabilityPoints(
  subregion?: string,
  siteClass?: string,
  minAvail: number = 0,
  maxAvail: number = 100
) {
  const { data, error } = await supabase.rpc("fetch_availability_points", {
    subregion_input: subregion || null,
    class_input: siteClass || null,
    min_avail: minAvail,
    max_avail: maxAvail,
  });

  if (error) throw error;
  return data ?? [];
}
