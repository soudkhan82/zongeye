// Client-safe helper (NO "use server") so you can import from client components too.

"use server";
import {
  AvailabilityPoint,
  ComplaintsPoint,
  SiteTrendsBundle,
  TrafficPoint,
  RevenuePoint,
} from "@/interfaces";
import supabase from "../config/supabase-config";

/** === Guards / helpers === */
function assertName(name: string): string {
  if (!name || typeof name !== "string") {
    throw new Error("Site name is required");
  }
  return name;
}

function normalizeMonth(m: unknown): string {
  // SQL functions return "YYYY-MM"; stringify as safety.
  return String(m ?? "");
}

function toNum(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  const n = Number(String(v).replace(/[, ]/g, ""));
  return Number.isFinite(n) ? n : null;
}

/** === RPC wrappers === */
export async function getTrafficTrend(name: string): Promise<TrafficPoint[]> {
  assertName(name);
  const { data, error } = await supabase.rpc("fetch_traffic_trend", {
    p_name: name,
  });
  if (error) throw error;

  return (data ?? []).map((d: TrafficPoint) => ({
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

  return (data ?? []).map((d: AvailabilityPoint) => ({
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

  return (data ?? []).map((d: ComplaintsPoint) => ({
    month: normalizeMonth(d.month),
    complaints_count: Number(d.complaints_count ?? 0),
  })) as ComplaintsPoint[];
}

/**
 * Revenue trend RPC
 * Expects Postgres function:
 *   fetch_revenue_trend(p_name text)
 * returning rows:
 *   { month: 'YYYY-MM', mful_total_rev, mful_data_rev, mful_voice_rev }
 */
export async function getRevenueTrend(name: string): Promise<{
  totalRevenue: RevenuePoint[];
  dataRevenue: RevenuePoint[];
  voiceRevenue: RevenuePoint[];
}> {
  assertName(name);
  const { data, error } = await supabase.rpc("fetch_revenue_trend", {
    p_name: name,
  });
  if (error) throw error;

  const rows = (data ?? []) as Array<{
    month: string;
    mful_total_rev: unknown;
    mful_data_rev: unknown;
    mful_voice_rev: unknown;
  }>;

  const totalRevenue: RevenuePoint[] = rows.map((r) => ({
    month: normalizeMonth(r.month),
    value: toNum(r.mful_total_rev),
  }));
  const dataRevenue: RevenuePoint[] = rows.map((r) => ({
    month: normalizeMonth(r.month),
    value: toNum(r.mful_data_rev),
  }));
  const voiceRevenue: RevenuePoint[] = rows.map((r) => ({
    month: normalizeMonth(r.month),
    value: toNum(r.mful_voice_rev),
  }));

  return { totalRevenue, dataRevenue, voiceRevenue };
}

/** === Bundle fetcher (parallel) === */
export async function getAllTrends(name: string): Promise<SiteTrendsBundle> {
  assertName(name);
  const [traffic, availability, complaints, revenue] = await Promise.all([
    getTrafficTrend(name),
    getAvailabilityTrend(name),
    getComplaintsTrend(name),
    getRevenueTrend(name),
  ]);

  return {
    traffic,
    availability,
    complaints,
    totalRevenue: revenue.totalRevenue,
    dataRevenue: revenue.dataRevenue,
    voiceRevenue: revenue.voiceRevenue,
  };
}
