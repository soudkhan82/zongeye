"use server";

import type { FeatureCollection, Feature, Point } from "geojson";
import supabase from "../config/supabase-config";

type Row = {
  id: number;
  SiteID: string | null;
  Region: string | null;
  DownTime: string | null;
  Locked: string | null;
  Accessible: string | null;
  Longitude: string | null;
  Latitude: string | null;
  District: string | null;
};

export async function getMonsoonSitesGeoJSON(): Promise<
  FeatureCollection<Point, Row>
> {
  const { data, error } = await supabase
    .from("monsoon_sites_joined")
    .select(
      "id, SiteID, Region, DownTime, Locked, Accessible, Longitude, Latitude, District"
    )
    .limit(20000);

  if (error) {
    throw new Error(`Query failed: ${error.message}`);
  }

  const features: Feature<Point, Row>[] = [];

  for (const r of (data ?? []) as Row[]) {
    const lon = Number(r.Longitude);
    const lat = Number(r.Latitude);
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue;

    features.push({
      type: "Feature",
      geometry: { type: "Point", coordinates: [lon, lat] },
      properties: r,
    });
  }

  return { type: "FeatureCollection", features };
}
