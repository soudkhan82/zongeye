"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useId,
} from "react";

import { getAllTrends } from "@/app/actions/sitetrends";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { SiteTrendsBundle } from "@/interfaces";

type Props = { name: string };

/* ---------- Shared UI helpers ---------- */

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="h-72 border-0 shadow-sm bg-gradient-to-b from-white to-slate-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-slate-800">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-full">
        <div className="h-56">{children}</div>
      </CardContent>
    </Card>
  );
}

function getSeriesColors(seriesName: string) {
  switch (seriesName) {
    case "Voice 2G":
      return { start: "#06b6d4", end: "#0ea5e9" }; // cyan → blue
    case "Voice 3G":
      return { start: "#22c55e", end: "#16a34a" }; // green
    case "VoLTE":
      return { start: "#f59e0b", end: "#ef4444" }; // amber → red
    case "Data 3G (GB)":
      return { start: "#a78bfa", end: "#8b5cf6" }; // violet
    case "Data 4G (GB)":
      return { start: "#ec4899", end: "#db2777" }; // pink
    case "Availability (%)":
      return { start: "#10b981", end: "#059669" }; // emerald
    case "Complaints":
      return { start: "#f97316", end: "#ef4444" }; // orange → red
    default:
      return { start: "#3b82f6", end: "#9333ea" }; // blue → purple
  }
}

/* ---------- Main component ---------- */

export default function TrendsClient({ name }: Props) {
  const [data, setData] = useState<SiteTrendsBundle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string | null>(null);

  // Tracks the latest in-flight request; older responses are ignored
  const reqIdRef = useRef(0);

  const getErrorMessage = (e: unknown): string => {
    if (e instanceof Error) return e.message;
    if (typeof e === "string") return e;
    try {
      return JSON.stringify(e);
    } catch {
      return "Unknown error";
    }
  };

  const load = useCallback(async () => {
    const myReqId = ++reqIdRef.current;
    setLoading(true);
    setErr(null);

    try {
      const bundle = await getAllTrends(name);
      if (reqIdRef.current === myReqId) {
        setData(bundle ?? null);
      }
    } catch (e: unknown) {
      if (reqIdRef.current === myReqId) {
        setErr(getErrorMessage(e));
        setData(null);
      }
    } finally {
      if (reqIdRef.current === myReqId) {
        setLoading(false);
      }
    }
  }, [name]);

  useEffect(() => {
    load();
    // Cleanup: invalidate any in-flight request when name changes/unmounts
    return () => {
      reqIdRef.current++;
    };
  }, [load]);

  const traffic = data?.traffic ?? [];
  const availability = data?.availability ?? [];
  const complaints = data?.complaints ?? [];

  // Build single-series datasets for each metric
  const sVoice2G = useMemo(
    () => traffic.map((d) => ({ month: d.month, value: d.voice2g_traffic })),
    [traffic]
  );
  const sVoice3G = useMemo(
    () => traffic.map((d) => ({ month: d.month, value: d.voice3g_traffic })),
    [traffic]
  );
  const sVoLTE = useMemo(
    () => traffic.map((d) => ({ month: d.month, value: d.volte_traffic })),
    [traffic]
  );
  const sData3G = useMemo(
    () => traffic.map((d) => ({ month: d.month, value: d.data3g_gb })),
    [traffic]
  );
  const sData4G = useMemo(
    () => traffic.map((d) => ({ month: d.month, value: d.data4g_gb })),
    [traffic]
  );

  const isEmpty =
    !loading &&
    !err &&
    sVoice2G.length === 0 &&
    sVoice3G.length === 0 &&
    sVoLTE.length === 0 &&
    sData3G.length === 0 &&
    sData4G.length === 0 &&
    availability.length === 0 &&
    complaints.length === 0;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <Button onClick={load} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </Button>
      </div>

      {err && (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-red-700">
          {err}
        </div>
      )}

      {/* Grid: max 4 per row */}
      {!err && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* 1) Voice 2G */}
          <ChartCard title="Voice 2G Traffic">
            <SingleLineChart data={sVoice2G} seriesName="Voice 2G" />
          </ChartCard>

          {/* 2) Voice 3G */}
          <ChartCard title="Voice 3G Traffic">
            <SingleLineChart data={sVoice3G} seriesName="Voice 3G" />
          </ChartCard>

          {/* 3) VoLTE */}
          <ChartCard title="VoLTE Traffic">
            <SingleLineChart data={sVoLTE} seriesName="VoLTE" />
          </ChartCard>

          {/* 4) Data 3G */}
          <ChartCard title="Data 3G (GB)">
            <SingleLineChart data={sData3G} seriesName="Data 3G (GB)" />
          </ChartCard>

          {/* 5) Data 4G */}
          <ChartCard title="Data 4G (GB)">
            <SingleLineChart data={sData4G} seriesName="Data 4G (GB)" />
          </ChartCard>

          {/* 6) Availability */}
          <ChartCard title="Availability (%)">
            <SimpleMetricLine
              data={availability}
              xKey="month"
              yKey="availability"
              seriesName="Availability (%)"
              yDomain={[0, 100]}
            />
          </ChartCard>

          {/* 7) Complaints */}
          <ChartCard title="Complaints (Monthly)">
            <SimpleMetricLine
              data={complaints}
              xKey="month"
              yKey="complaints_count"
              seriesName="Complaints"
              integerTicks
            />
          </ChartCard>
        </div>
      )}

      {isEmpty && (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            No trend data found.
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            Loading trends…
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ---------- Stylish charts (shared) ---------- */

function SingleLineChart({
  data,
  seriesName,
}: {
  data: { month: string; value: number | null }[];
  seriesName: string;
}) {
  const id = useId(); // unique gradient ids per instance
  const { start, end } = getSeriesColors(seriesName);
  const lineId = `line-${id}`;
  const areaId = `area-${id}`;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
        <defs>
          <linearGradient id={lineId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={start} />
            <stop offset="100%" stopColor={end} />
          </linearGradient>
          <linearGradient id={areaId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={start} stopOpacity={0.22} />
            <stop offset="100%" stopColor={end} stopOpacity={0.05} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: "#6b7280" }}
          tickMargin={6}
        />
        <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
        <Tooltip
          cursor={{ strokeDasharray: "3 3" }}
          contentStyle={{
            backgroundColor: "rgba(255,255,255,0.95)",
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
          }}
          labelStyle={{ color: "#111827" }}
          itemStyle={{ color: "#374151" }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />

        <Line
          type="monotone"
          dataKey="value"
          name={seriesName}
          stroke={`url(#${lineId})`}
          strokeWidth={2.6}
          dot={{ r: 2.5, stroke: "#fff", strokeWidth: 1 }}
          activeDot={{ r: 5, stroke: end, strokeWidth: 2 }}
          fill={`url(#${areaId})`}
          strokeOpacity={0.95}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function SimpleMetricLine({
  data,
  xKey,
  yKey,
  seriesName,
  yDomain,
  integerTicks = false,
}: {
  data: any[];
  xKey: string;
  yKey: string;
  seriesName: string;
  yDomain?: [number, number];
  integerTicks?: boolean;
}) {
  const id = useId();
  const { start, end } = getSeriesColors(seriesName);
  const lineId = `line-${id}`;
  const areaId = `area-${id}`;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
        <defs>
          <linearGradient id={lineId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={start} />
            <stop offset="100%" stopColor={end} />
          </linearGradient>
          <linearGradient id={areaId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={start} stopOpacity={0.22} />
            <stop offset="100%" stopColor={end} stopOpacity={0.05} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 11, fill: "#6b7280" }}
          tickMargin={6}
        />
        <YAxis
          domain={yDomain}
          allowDecimals={!integerTicks}
          tick={{ fontSize: 11, fill: "#6b7280" }}
        />
        <Tooltip
          cursor={{ strokeDasharray: "3 3" }}
          contentStyle={{
            backgroundColor: "rgba(255,255,255,0.95)",
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
          }}
          labelStyle={{ color: "#111827" }}
          itemStyle={{ color: "#374151" }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />

        <Line
          type="monotone"
          dataKey={yKey}
          name={seriesName}
          stroke={`url(#${lineId})`}
          strokeWidth={2.6}
          dot={{ r: 2.5, stroke: "#fff", strokeWidth: 1 }}
          activeDot={{ r: 5, stroke: end, strokeWidth: 2 }}
          fill={`url(#${areaId})`}
          strokeOpacity={0.95}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
