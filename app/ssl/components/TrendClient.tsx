"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getAllTrends, type SiteTrendsBundle } from "@/app/actions/sitetrends";
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

type Props = { name: string };

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
      // Only update if this is the latest request
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
        <h1 className="text-2xl md:text-3xl font-bold">Trends — {name}</h1>
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
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={availability}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="availability"
                  name="Availability (%)"
                  dot
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 7) Complaints */}
          <ChartCard title="Complaints (Monthly)">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={complaints}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="complaints_count"
                  name="Complaints"
                  dot
                />
              </LineChart>
            </ResponsiveContainer>
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

/* ---------- Small helpers/components ---------- */

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="h-72">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-full">
        <div className="h-56">{children}</div>
      </CardContent>
    </Card>
  );
}

function SingleLineChart({
  data,
  seriesName,
}: {
  data: { month: string; value: number | null }[];
  seriesName: string;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="value" name={seriesName} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
