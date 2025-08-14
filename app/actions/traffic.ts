// app/lib/Traffic.
"use server";
import supabase from "../config/supabase-config";

export type TrafficRow = {
  Name: string;
  SubRegion: string;
  District: string | null;
  Grid: string | null;
  Latitude: number | null;
  Longitude: number | null;
  SiteClassification: string | null;
  voice_total: number | null; // averaged in SQL
  data_total: number | null; // averaged in SQL
};

type Range = { min: number; max: number };

export async function fetchSitesWithTraffic(params: {
  subregion?: string | null;
  district?: string | null;
  grid?: string | null;
  voiceRange?: Range;
  dataRange?: Range;
}): Promise<TrafficRow[]> {
  const {
    subregion = null,
    district = null,
    grid = null,
    voiceRange = { min: 0, max: Number.MAX_SAFE_INTEGER },
    dataRange = { min: 0, max: Number.MAX_SAFE_INTEGER },
  } = params ?? {};

  const { data, error } = await supabase.rpc("fetch_sites_with_traffic_avg", {
    p_subregion: !subregion || subregion === "ALL" ? null : subregion,
    p_district: !district || district === "ALL" ? null : district,
    p_grid: !grid || grid === "ALL" ? null : grid,
    p_voice_min: voiceRange.min,
    p_voice_max: voiceRange.max,
    p_data_min: dataRange.min,
    p_data_max: dataRange.max,
  });

  if (error) throw new Error(error.message);
  return (data ?? []) as TrafficRow[];
}
