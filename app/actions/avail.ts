"use server";

import supabase from "../config/supabase-config";

export async function getAvailAll() {
  const { data, error } = await supabase.from("avail").select("*");
  if (error) throw new Error(error.message);
  return data;
}

export async function getAvailperMonth(subregion: string) {
  const { data, error } = await supabase.rpc("avg_availability_per_month", {
    subregion_input: subregion,
  });
  if (error) throw new Error(error.message);

  return data as { month: string; avg_availability: number }[];
}

export async function getAvgAvailByCat(subregion: string, cat: string) {
  const { data, error } = await supabase.rpc(
    "avg_availability_by_month_and_cat",
    {
      subregion_input: subregion,
      cat_input: cat,
    }
  );
  if (error) throw new Error(error.message);
  return data as { month: string; avg_availability: number }[];
}

export async function getSubRegions() {
  const { data, error } = await supabase.rpc("get_subregions");
  if (error) throw new Error(error.message);

  return data.map((d: { subregion: string }) => d.subregion);
}
