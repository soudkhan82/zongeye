"use server";
import { FuelModel } from "@/interfaces";
import supabase from "../config/supabase-config";

export async function fetchFuelData({
  name,
  district,
}: {
  name: string;
  district: string;
}): Promise<{ data: FuelModel[]; error: string | null }> {
  const { data, error } = await supabase.rpc("get_fuel_details", {
    search_name: name || null,
    search_district: district || null,
  });

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: data ?? [], error: null };
}
