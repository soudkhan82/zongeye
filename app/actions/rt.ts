// lib/api/fetchSitesWithTraffic.ts
"use server";
import { VoiceStats, VoiceTraffic } from "@/interfaces";
import supabase from "../config/supabase-config";

// export async function getDistricts() {
//   const { data, error } = await supabase.rpc("get_districts");
//   if (error) throw new Error(error.message);
//   if (!error) {
//     console.log(data);
//   }
//   return data.map((d: { distict: string }) => d.distict);
// }

export async function getDistricts(subregion?:string): Promise<string[]> {
let q = supabase
    .from("ssl")
    .select("District")
    .not("District", "is", null);

  if (subregion && subregion.trim() !== "") {
    q = q.eq("SubRegion", subregion);
  }

  const { data, error } = await q.order("District", { ascending: true });
  if (error) throw error;

  return Array.from(new Set((data ?? []).map(r => r.District as string)));
}

export async function fetchVoiceTraffic(
  selectedSubRegion: string
): Promise<VoiceTraffic[]> {
  const { data, error } = await supabase.rpc("fetch_sites_with_voice_traffic", {
    subregion_input: selectedSubRegion,
  });

  if (error) {
    console.error("RPC Error:", error);
    return [];
  } else {
  }

  return data as VoiceTraffic[];
}
export async function fetchVoiceStats(
  selectedSubRegion: string
): Promise<VoiceStats> {
  const { data, error } = await supabase.rpc("fetch_voice_stats", {
    subregion_input: selectedSubRegion,
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
