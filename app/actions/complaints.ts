// app/actions/complaints.ts
"use server";

import supabase from "../config/supabase-config";

export type SiteRow = {
  siteId: string;
  grid: string | null;
  district: string | null;
  classification: string | null;
  servicetitle: string | null;
  address: string | null; // ✅ new
  count: number;
};

export type Point = {
  siteId: string;
  lng: number | null;
  lat: number | null;
  grid: string | null;
  district: string | null;
  classification: string | null;
  address: string | null; // ✅ new
  count: number;
};

export type GridBucket = { grid: string | null; count: number };
export type ServiceBucket = { name: string; value: number };

export interface ComplaintsDashboardPayload {
  total: number;
  rows: SiteRow[];
  points: Point[];
  gridcounts: GridBucket[];
  servicecounts: ServiceBucket[];
}

export async function getComplaintsDashboard(
  subregion?: string | null
): Promise<ComplaintsDashboardPayload> {
  const { data, error } = await supabase.rpc("complaints_dashboard_simple", {
    p_subregion: subregion ?? null, // pass-through as-is
  });

  if (error) throw new Error(error.message);

  return {
    total: Number(data?.total ?? 0),
    rows: (data?.rows ?? []) as SiteRow[],
    points: (data?.points ?? []) as Point[],
    gridcounts: (data?.gridcounts ?? []) as GridBucket[],
    servicecounts: (data?.servicecounts ?? []) as ServiceBucket[],
  };
}

// app/actions/site-trend.ts

export type TrendPoint = { date: string; count: number };

export interface SiteTrend {
  name: string;
  from: string | null;
  to: string | null;
  total: number;
  series: TrendPoint[];
  serviceCounts: ServiceBucket[];
}

export async function getSiteTrend(
  name: string,
  from?: string | null,
  to?: string | null
): Promise<SiteTrend> {
  const { data, error } = await supabase.rpc("complaints_timeseries_for_name", {
    p_name: name,
    p_from: from ?? null,
    p_to: to ?? null,
  });
  if (error) throw new Error(error.message);
  return data as SiteTrend;
}
