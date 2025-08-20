// app/actions/siteTrends.ts
// Client-safe helper (no "use server") so you can import from client components too.

"use server";
import supabase from "../config/supabase-config";

/** === Types === */
export type TrafficPoint = {
  month: string; // "YYYY-MM"
  voice2g_traffic: number | null;
  voice3g_traffic: number | null;
  volte_traffic: number | null;
  data3g_gb: number | null;
  data4g_gb: number | null;
};

export type AvailabilityPoint = {
  month: string; // "YYYY-MM" (as stored in avail.month)
  availability: number | null;
};

export type ComplaintsPoint = {
  month: string; // "YYYY-MM"
  complaints_count: number; // integer
};

export type SiteTrendsBundle = {
  traffic: TrafficPoint[];
  availability: AvailabilityPoint[];
  complaints: ComplaintsPoint[];
};

/** === Guards / helpers === */
function assertName(name: string): string {
  if (!name || typeof name !== "string") {
    throw new Error("Site name is required");
  }
  return name;
}

function normalizeMonth(m: unknown): string {
  // All SQL functions already return "YYYY-MM"; just stringify as safety.
  return String(m ?? "");
}

/** === RPC wrappers === */
export async function getTrafficTrend(name: string): Promise<TrafficPoint[]> {
  assertName(name);
  const { data, error } = await supabase.rpc("fetch_traffic_trend", {
    p_name: name,
  });
  if (error) throw error;

  return (data ?? []).map((d: any) => ({
    month: normalizeMonth(d.month),
    voice2g_traffic: d.voice2g_traffic ?? null,
    voice3g_traffic: d.voice3g_traffic ?? null,
    volte_traffic: d.volte_traffic ?? null,
    data3g_gb: d.data3g_gb ?? null,
    data4g_gb: d.data4g_gb ?? null,
  })) as TrafficPoint[];
}

export async function getAvailabilityTrend(
  name: string
): Promise<AvailabilityPoint[]> {
  assertName(name);
  const { data, error } = await supabase.rpc("fetch_availability_trend", {
    p_name: name,
  });
  if (error) throw error;

  return (data ?? []).map((d: any) => ({
    month: normalizeMonth(d.month),
    availability: d.availability ?? null,
  })) as AvailabilityPoint[];
}

export async function getComplaintsTrend(
  name: string
): Promise<ComplaintsPoint[]> {
  assertName(name);
  const { data, error } = await supabase.rpc("fetch_complaints_trend", {
    p_name: name,
  });
  if (error) throw error;

  return (data ?? []).map((d: any) => ({
    month: normalizeMonth(d.month),
    complaints_count: Number(d.complaints_count ?? 0),
  })) as ComplaintsPoint[];
}

/** === Bundle fetcher (parallel) === */
export async function getAllTrends(name: string): Promise<SiteTrendsBundle> {
  assertName(name);
  const [traffic, availability, complaints] = await Promise.all([
    getTrafficTrend(name),
    getAvailabilityTrend(name),
    getComplaintsTrend(name),
  ]);
  return { traffic, availability, complaints };
}
