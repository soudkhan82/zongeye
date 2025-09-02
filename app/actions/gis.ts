// app/actions/gis.ts
"use server";

import supabase from "@/app/config/supabase-config";

export type DailyRow = {
  SubRegion: string | null;
  Timeline: string; // "YYYY-MM-DD"
  AvgAvailability: number | null;
};

export type DistrictSummaryRow = {
  SubRegion: string | null;
  District: string | null;
  SiteCount: number;
  AvgAvailability: number | null;
};

export async function getAvailabilityDaily(): Promise<DailyRow[]> {
  const { data, error } = await supabase.rpc("availability_daily");
  if (error) {
    console.error("availability_daily error:", error);
    return [];
  }
  return (data ?? []) as DailyRow[];
}

export async function getAvailabilityDistrictSummary(): Promise<
  DistrictSummaryRow[]
> {
  const { data, error } = await supabase.rpc("availability_district_summary");
  if (error) {
    console.error("availability_district_summary error:", error);
    return [];
  }
  return (data ?? []) as DistrictSummaryRow[];
}

export type SitePointRow = {
  id: number;
  SiteID: string | null;
  Name: string | null;
  Region: string | null;
  District: string | null;
  lon: number | null;
  lat: number | null;
};

export type Feature = {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: {
    id: number;
    SiteID: string | null;
    Name: string | null;
    Region: string | null;
    District: string | null;
  };
};

export type FeatureCollection = {
  type: "FeatureCollection";
  features: Feature[];
};

export async function getMonsoonSitesFC(): Promise<FeatureCollection> {
  const { data, error } = await supabase
    .rpc("monsoon_sites_points")
    .returns<SitePointRow[]>();
  const rows = (data ?? []) as SitePointRow[];
  if (error) {
    console.error("[gis] monsoon_sites_points error:", error);
    return { type: "FeatureCollection", features: [] };
  }

  const features: Feature[] = rows
    .map((r: SitePointRow) => {
      // ← typed
      if (r.lon == null || r.lat == null) return null;
      const lon = Number(r.lon);
      const lat = Number(r.lat);
      if (!Number.isFinite(lon) || !Number.isFinite(lat)) return null;
      return {
        type: "Feature",
        geometry: { type: "Point", coordinates: [lon, lat] },
        properties: {
          id: r.id,
          SiteID: r.SiteID,
          Name: r.Name,
          Region: r.Region,
          District: r.District,
        },
      };
    })
    .filter(Boolean) as Feature[];
  return { type: "FeatureCollection", features };
}
export type SiteAvailabilityRow = {
  SiteID: string;
  District: string | null;
  Availability: number | null; // latest or desired metric
};

export async function getSiteAvailabilityTable(): Promise<
  SiteAvailabilityRow[]
> {
  const { data, error } = await supabase
    .rpc("site_avg_availability") // ⬅️ switched from site_latest_availability
    .returns<SiteAvailabilityRow[]>();

  if (error) {
    console.error("[gis] site_avg_availability error:", error);
    return [];
  }
  if (!Array.isArray(data)) return [];
  return data;
}

export type SubregionDailyRow = {
  SubRegion: string | null;
  Timeline: string; // "YYYY-MM-DD"
  AvgAvailability: number | null;
};

export async function getSubregionAvailabilityDaily(): Promise<
  SubregionDailyRow[]
> {
  const { data, error } = await supabase
    .rpc("subregion_availability_daily")
    .returns<SubregionDailyRow[]>();

  if (error) {
    console.error("[gis] subregion_availability_daily error:", error);
    return [];
  }
  return Array.isArray(data) ? data : [];
}
// in gis.ts
export type EquipCountsRow = {
  SubRegion: string | null;
  moved_yes: number;
  packed_yes: number;
  total: number;
};

export async function getEquipmentCounts(): Promise<EquipCountsRow[]> {
  const { data, error } = await supabase
    .rpc("monsoon_sites_equipment_counts")
    .returns<EquipCountsRow[]>(); // RPC returns SETOF rows

  if (error) {
    console.error("[equip RPC] error:", error);
    return [];
  }

  const rows = Array.isArray(data) ? (data as EquipCountsRow[]) : [];
  console.log("[equip RPC] rows:", rows.length, rows);
  return rows;
}
