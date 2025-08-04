"use server";

import supabase from "../config/supabase-config";

export async function getAvailAll() {
  const { data, error } = await supabase.from("avail").select("*");
  if (error) throw new Error(error.message);
  return data;
}

export async function fetchAvailperMonth() {
  const { data, error } = await supabase.rpc("availability");
  if (error) throw new Error(error.message);

  return data as { month: string; avg_avail: number }[];
}
