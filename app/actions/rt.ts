// lib/api/fetchSitesWithTraffic.ts
"use server";
import { DataStats, DataTraffic, VoiceStats, VoiceTraffic } from "@/interfaces";
import supabase from "../config/supabase-config";

// export async function getDistricts() {
//   const { data, error } = await supabase.rpc("get_districts");
//   if (error) throw new Error(error.message);
//   if (!error) {
//     console.log(data);
//   }
//   return data.map((d: { distict: string }) => d.distict);
// }
export async function getSubRegions() {
  const { data, error } = await supabase.rpc("get_subregions");
  if (error) throw new Error(error.message);

  return data.map((d: { subregion: string }) => d.subregion);
}
export async function getDistricts(subregion?: string): Promise<string[]> {
  let q = supabase.from("ssl").select("District").not("District", "is", null);

  if (subregion && subregion.trim() !== "") {
    q = q.eq("SubRegion", subregion);
  }

  const { data, error } = await q.order("District", { ascending: true });
  if (error) throw error;

  return Array.from(new Set((data ?? []).map((r) => r.District as string)));
}

export async function fetchVoiceTraffic(
  selectedSubRegion: string | null,
  selectedDistrict: string | null
): Promise<VoiceTraffic[]> {
  const { data, error } = await supabase.rpc("fetch_sites_with_voice_traffic", {
    subregion_input: selectedSubRegion,
    district_input: selectedDistrict || null,
  });

  if (error) {
    console.error("RPC Error:", error);
    return [];
  }

  return (data ?? []) as VoiceTraffic[];
}
export async function fetchVoiceStats(
  selectedSubRegion: string,
  selectedDistrict: string | null
): Promise<VoiceStats> {
  const { data, error } = await supabase.rpc("fetch_voice_stats", {
    subregion_input: selectedSubRegion,
    district_input: selectedDistrict,
  });
  if (error) console.error("RPC Error:", error);
  const row = (data && data[0]) || null;

  return (
    row ?? {
      distinct_sites: 0,
      avg_voice2g: null,
      min_voice2g: null,
      max_voice2g: null,
      total_voice_revenue: null,
      avg_voice_revenue: null,
    }
  );
}

export async function fetchDataTraffic(
  selectedSubRegion: string,
  selectedDistrict: string | null
): Promise<DataTraffic[]> {
  const { data, error } = await supabase.rpc("fetch_sites_with_data_traffic", {
    subregion_input: selectedSubRegion,
    district_input: selectedDistrict || null,
  });
  if (error) {
    console.error("RPC error", error);
    return [];
  }
  return data as DataTraffic[];
}

export async function fetchDataStats(
  selectedSubRegion: string,
  selectedDistrict: string | null
): Promise<DataStats> {
  const { data, error } = await supabase.rpc("fetch_data_stats", {
    subregion_input: selectedSubRegion,
    district_input: selectedDistrict,
  });
  if (error) {
    console.log("RPC error", error);
  }
  const row = (data && data[0]) || null;
  return (
    row ?? {
      distinct_sites: 0,
      avg_data3g: null,
      avg_data4g: null,
      total_data_revenue: null,
      avg_data_revenue: null,
    }
  );
}
