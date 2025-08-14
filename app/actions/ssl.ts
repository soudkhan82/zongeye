"use server";
import { siteVitals, sslSite } from "@/interfaces";
import supabase from "../config/supabase-config";

const clean = (v?: string | null) => {
  const s = (v ?? "").trim();
  return s === "" ? null : s;
};

export async function fetchSslSites(
  subregion: string, // required
  grid?: string | null, // optional
  district?: string | null // optional
): Promise<sslSite[]> {
  let q = supabase
    .from("ssl")
    .select(
      "Name, District, Grid, Address, SiteClassification, SubRegion, Latitude, Longitude"
    );

  const s = clean(subregion);
  const g = clean(grid);
  const d = clean(district);

  if (s) q = q.eq("SubRegion", s);
  if (g) q = q.eq("Grid", g);
  if (d) q = q.eq("District", d);

  const { data, error } = await q.order("Name", { ascending: true });
  if (error) throw error;

  // type guard: ensures latitude and longitude are numbers
  //   function hasCoords(
  //     r: any
  //   ): r is any & { Latitude: number; Longitude: number } {
  //     return r?.Latitude != null && r?.Longitude != null;
  //   }

  return (
    (data ?? [])
      // .filter(hasCoords)
      .map((r) => ({
        name: r.Name,
        district: r.District,
        grid: r.Grid,
        address: r.Address,
        Siteclassification: r.SiteClassification, // fixed capitalisation
        subregion: r.SubRegion,
        latitude: Number(r.Latitude),
        longitude: Number(r.Longitude),
      }))
  );
}

export async function getGrids(subregion?: string | null): Promise<string[]> {
  let q = supabase.from("ssl").select("Grid").not("Grid", "is", null);
  const s = clean(subregion);
  if (s) q = q.eq("SubRegion", s);
  const { data, error } = await q.order("Grid", { ascending: true });
  if (error) throw error;
  return Array.from(new Set((data ?? []).map((r) => r.Grid)));
}

export async function getDistricts(
  subregion?: string | null
): Promise<string[]> {
  let q = supabase.from("ssl").select("District").not("District", "is", null);
  const s = clean(subregion);
  if (s) q = q.eq("SubRegion", s);
  const { data, error } = await q.order("District", { ascending: true });
  if (error) throw error;
  return Array.from(new Set((data ?? []).map((r) => r.District)));
}

export async function get_site_vitals_by_site(
  name: string
): Promise<siteVitals[]> {
  const { data, error } = await supabase
    .from("rt_trend")
    .select("*")
    .eq("Name", name)
    .order("Month", { ascending: true });
  console.log(data);
  if (error) throw error;

  return data;
}

export type SslRow = {
  Name: string;
  SiteClassification:
    | "Platinum"
    | "Gold"
    | "Strategic"
    | "Silver"
    | "Bronze"
    | null;
  SubRegion: string | null;
  Region: string | null;
  Latitude: number | null;
  Longitude: number | null;
  District: string | null;
  Grid: string | null;
};

export type ClassCount = {
  name: "Platinum" | "Gold" | "Strategic" | "Silver" | "Bronze";
  value: number;
};

export type SubregionBucket = { subregion: string | null; value: number };

export async function getSslDashboard(region?: string | null): Promise<{
  sites: SslRow[];
  classCounts: ClassCount[];
  subregionCounts: SubregionBucket[];
}> {
  const p_region = region ?? null;

  const [sitesRes, classRes, subRes] = await Promise.all([
    supabase.rpc("fetch_ssl_sites", { p_region }),
    supabase.rpc("fetch_ssl_class_counts", { p_region }),
    supabase.rpc("fetch_ssl_subregion_counts", { p_region }),
  ]);

  if (sitesRes.error) throw sitesRes.error;
  if (classRes.error) throw classRes.error;
  if (subRes.error) throw subRes.error;

  return {
    sites: (sitesRes.data ?? []) as SslRow[],
    classCounts: (classRes.data ?? []) as ClassCount[],
    subregionCounts: (subRes.data ?? []) as SubregionBucket[],
  };
}
