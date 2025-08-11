"use server";
import { sslSite } from "@/interfaces";
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
