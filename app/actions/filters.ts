"use server";
import supabase from "../config/supabase-config";

export async function getSubregions(): Promise<string[]> {
  const { data, error } = await supabase.rpc("get_subregions");
  if (error) throw new Error(error.message);
  return (data ?? []).map((r: { SubRegion: string }) => r.SubRegion);
}

export async function getDistricts(subregion: string): Promise<string[]> {
  const { data, error } = await supabase.rpc("get_districts", {
    p_subregion: subregion,
  });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r: { District: string }) => r.District);
}

export async function getGrids(
  subregion: string,
  district?: string | null
): Promise<string[]> {
  const { data, error } = await supabase.rpc("get_grids", {
    p_subregion: subregion,
    p_district: district ?? null,
  });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r: { Grid: string }) => r.Grid);
}
