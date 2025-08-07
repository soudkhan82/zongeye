// lib/api/fetchSitesWithTraffic.ts
"use server";
import { VoiceTraffic } from "@/interfaces";
import supabase from "../config/supabase-config";

export async function fetchVoiceTraffic(
  selectedSubRegion: string
): Promise<VoiceTraffic[]> {
  const { data, error } = await supabase.rpc("fetch_sites_with_vt", {
    subregion_input: selectedSubRegion,
  });

  if (error) {
    console.error("RPC Error:", error);
    return [];
  } else {
  }

  return data as VoiceTraffic[];
}
