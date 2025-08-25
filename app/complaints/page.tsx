// app/complaints/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import Map, { Marker, Popup, MapRef } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import CsvDownloadButton from "@/app/components/csvdownload";
import {
  getComplaintsDashboard,
  type ComplaintsDashboardPayload,
  type SiteRow,
  type Point,
} from "@/app/actions/complaints";
import { getSubregions } from "@/app/actions/filters";

import { getSiteTrend, type SiteTrend } from "@/app/actions/complaints";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  Legend,
} from "recharts";

export default function ComplaintsPage() {
  const mapRef = useRef<MapRef | null>(null);

  // types for chart data
  type GridCount = { grid: string; count: number };

  // Default subregion
  const [subregion, setSubregion] = useState<string>("North-1");
  const [subregions, setSubregions] = useState<string[]>([]);
  const [search, setSearch] = useState<string>("");

  const [payload, setPayload] = useState<ComplaintsDashboardPayload | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);
  const [selected, setSelected] = useState<Point | null>(null);

  // Trend dialog state
  const [trendOpen, setTrendOpen] = useState<boolean>(false);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [trend, setTrend] = useState<SiteTrend | null>(null);
  const [trendLoading, setTrendLoading] = useState<boolean>(false);
  const [trendErr, setTrendErr] = useState<string | null>(null);

  function getErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    if (typeof err === "string") return err;
    try {
      return JSON.stringify(err);
    } catch {
      return "Failed to load data";
    }
  }

  // Load subregions
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await getSubregions();
        if (!mounted) return;
        setSubregions(list ?? []);
        if (
          Array.isArray(list) &&
          list.length > 0 &&
          !list.includes("North-1")
        ) {
          setSubregion(list[0]);
        }
      } catch (e: unknown) {
        if (mounted) setErr(getErrorMessage(e));
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await getComplaintsDashboard(subregion || null);
      setPayload(data);
    } catch (e: unknown) {
      setErr(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subregion]);

  // Search
  const filteredRows: SiteRow[] = useMemo((): SiteRow[] => {
    if (!payload?.rows) return [];
    const q = search.trim().toLowerCase();
    if (!q) return payload.rows;
    return payload.rows.filter((r: SiteRow) => {
      const a = (r.siteId ?? "").toLowerCase();
      const b = (r.grid ?? "").toLowerCase();
      const c = (r.district ?? "").toLowerCase();
      const d = (r.classification ?? "").toLowerCase();
      const e = (r.address ?? "").toLowerCase();
      return (
        a.includes(q) ||
        b.includes(q) ||
        c.includes(q) ||
        d.includes(q) ||
        e.includes(q)
      );
    });
  }, [payload, search]);

  const filteredTotalComplaints = useMemo<number>(() => {
    return filteredRows.reduce((sum, r) => sum + (r.count ?? 0), 0);
  }, [filteredRows]);

  // Marker sizing
  const [minCount, maxCount] = useMemo((): [number, number] => {
    const counts = (payload?.points ?? []).map((p: Point) => p.count ?? 0);
    return counts.length ? [Math.min(...counts), Math.max(...counts)] : [0, 0];
  }, [payload]);

  const sizeFor = (count: number): number => {
    const minSize = 6,
      maxSize = 28;
    if (maxCount === minCount)
      return minCount > 0 ? (minSize + maxSize) / 2 : minSize;
    const t = (count - minCount) / (maxCount - minCount);
    return Math.round(minSize + t * (maxSize - minSize));
  };

  // ======== Charts data (filtered) ========
  const gridCountsRaw = useMemo<GridCount[]>(() => {
    const arr = (payload?.gridcounts ?? []) as Array<{
      grid?: string | null;
      count?: number | string | null;
    }>;
    return arr.map((g) => ({
      grid: g.grid ?? "—",
      count: typeof g.count === "number" ? g.count : Number(g.count ?? 0),
    }));
  }, [payload]);

  // District counts (updates with filteredRows)
  const districtCounts = useMemo(() => {
    const agg = new globalThis.Map<string, number>();
    for (const r of filteredRows) {
      const name = (r.district ?? "—").trim() || "—";
      const cnt = typeof r.count === "number" ? r.count : Number(r.count ?? 0);
      agg.set(name, (agg.get(name) ?? 0) + (Number.isFinite(cnt) ? cnt : 0));
    }
    const entries: [string, number][] = Array.from(agg.entries());
    return entries
      .map(([district, value]) => ({ district, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredRows]);

  // Grid chart: recompute from filtered rows when searching; else use payload
  const gridChartData = useMemo<GridCount[]>(() => {
    if (!search.trim()) return gridCountsRaw;
    const agg = new globalThis.Map<string, number>();
    for (const r of filteredRows) {
      const key = r.grid ?? "—";
      agg.set(key, (agg.get(key) ?? 0) + (r.count ?? 0));
    }
    return Array.from(agg.entries())
      .map(([grid, count]) => ({ grid, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredRows, gridCountsRaw, search]);
  // ======== /Charts data ========

  // Map helpers
  const fitToAll = (): void => {
    if (!mapRef.current || !payload?.points?.length) return;
    const bounds = new maplibregl.LngLatBounds();
    payload.points.forEach((p: Point) => {
      if (typeof p.lng === "number" && typeof p.lat === "number")
        bounds.extend([p.lng, p.lat]);
    });
    if (!bounds.isEmpty())
      mapRef.current.fitBounds(bounds, { padding: 40, duration: 800 });
  };

  const flyToSite = (siteId: string): void => {
    if (!mapRef.current || !payload?.points?.length) return;
    const p = payload.points.find((x: Point) => x.siteId === siteId);
    if (!p || typeof p.lng !== "number" || typeof p.lat !== "number") return;
    mapRef.current.flyTo({ center: [p.lng, p.lat], zoom: 11, duration: 900 });
    setSelected(p);
  };

  // Trend dialog
  const openTrend = (name: string): void => {
    setSelectedName(name);
    setTrendOpen(true);
  };

  useEffect(() => {
    (async () => {
      if (!trendOpen || !selectedName) return;
      setTrendLoading(true);
      setTrendErr(null);
      try {
        const data = await getSiteTrend(selectedName, null, null);
        setTrend(data);
      } catch (e: unknown) {
        setErr(getErrorMessage(e));
      } finally {
        setTrendLoading(false);
      }
    })();
  }, [trendOpen, selectedName]);

  // Prepare top services (badges) — still shown inside Trend dialog
  const topServices = useMemo(
    (): { name: string; value: number }[] =>
      trend?.serviceCounts
        ? [...trend.serviceCounts].sort((a, b) => b.value - a.value).slice(0, 8)
        : [],
    [trend]
  );

  return (
    <div className="w-full p-4 space-y-4">
      <h1 className="text-2xl font-bold text-center my-6">
        Complaints — Sites, Map & Charts
        <div className="text-sm text-muted-foreground">
          <b> Total (Complaints): </b>
          <span className="font-semibold">
            {filteredTotalComplaints.toLocaleString()}
          </span>
        </div>
      </h1>

      {/* Controls */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">Subregion</span>
          <Select
            value={subregion ?? ""}
            onValueChange={(v: string) => setSubregion(v || "")}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select subregion" />
            </SelectTrigger>
            <SelectContent>
              {subregions.map((s: string) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[240px]">
          <Input
            placeholder="Search by Site ID, Grid, District, Classification…"
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearch(e.target.value)
            }
          />
        </div>

        <Button onClick={fetchData} disabled={loading}>
          {loading ? "Loading…" : "Refresh"}
        </Button>
        <CsvDownloadButton
          data={filteredRows}
          filename={`complaints_sites_${subregion || "all"}_${new Date()
            .toISOString()
            .slice(0, 10)}.csv`}
          title="Download the table rows as CSV"
          columns={[
            { header: "Site ID", accessor: "siteId" as const },
            { header: "Grid", accessor: "grid" as const },
            { header: "District", accessor: "district" as const },
            { header: "Classification", accessor: "classification" as const },
            { header: "Complaints", accessor: "count" as const },
            { header: "Address", accessor: "address" as const },
          ]}
        />

        <div className="text-sm ml-auto">
          Total:{" "}
          <span className="font-semibold">
            {(payload?.total ?? 0).toLocaleString()}
          </span>
          <span className="ml-3 text-xs text-muted-foreground">
            rows: {payload?.rows?.length ?? 0} • points:{" "}
            {payload?.points?.length ?? 0}
          </span>
        </div>
      </div>

      {err && <div className="text-red-600 text-sm">{err}</div>}

      {/* Map + Table */}
      <div className="grid xl:grid-cols-2 gap-4">
        {/* Map */}
        <Card className="h-[560px]">
          <CardHeader>
            <div className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-semibold">
                {filteredRows.length.toLocaleString()}
              </span>
              {typeof payload?.rows?.length === "number" && (
                <>
                  {" "}
                  of{" "}
                  <span className="font-semibold">
                    {payload.rows.length.toLocaleString()}
                  </span>
                </>
              )}
              {search.trim() ? " (filtered)" : ""}
            </div>
          </CardHeader>
          <CardContent className="h-[500px]">
            <div className="h-full rounded-lg overflow-hidden">
              <Map
                ref={mapRef}
                initialViewState={{
                  longitude: 67.0011,
                  latitude: 24.8607,
                  zoom: 5,
                }}
                mapLib={maplibregl}
                style={{ width: "100%", height: "100%" }}
                mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
                onLoad={fitToAll}
              >
                {(payload?.points ?? []).map((p: Point) => {
                  if (typeof p.lng !== "number" || typeof p.lat !== "number")
                    return null;
                  const size = sizeFor(p.count ?? 0);
                  return (
                    <Marker
                      key={p.siteId}
                      longitude={p.lng}
                      latitude={p.lat}
                      anchor="center"
                      onClick={(e) => {
                        e.originalEvent?.stopPropagation?.();
                        setSelected(p);
                      }}
                    >
                      <div
                        className="rounded-full border"
                        title={`${p.siteId} • ${p.count} complaints`}
                        style={{
                          width: size,
                          height: size,
                          background: "#4b5563",
                          borderColor: "#ffffffcc",
                          boxShadow: "0 0 0 2px rgba(107,114,128,0.25)",
                        }}
                      />
                    </Marker>
                  );
                })}

                {selected &&
                  typeof selected.lng === "number" &&
                  typeof selected.lat === "number" && (
                    <Popup
                      longitude={selected.lng}
                      latitude={selected.lat}
                      anchor="top"
                      closeOnClick={false}
                      onClose={() => setSelected(null)}
                    >
                      <div className="text-sm space-y-1">
                        <div className="font-semibold">{selected.siteId}</div>
                        <div>Grid: {selected.grid ?? "—"}</div>
                        <div>District: {selected.district ?? "—"}</div>
                        <div>Class: {selected.classification ?? "—"}</div>
                        <div>Complaints: {selected.count ?? "—"}</div>
                        <div>Address: {selected.address ?? "—"}</div>
                      </div>
                    </Popup>
                  )}
              </Map>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="h-[560px]">
          <CardHeader>
            <CardTitle>Complaints per Site</CardTitle>
          </CardHeader>

          <CardContent className="h-[500px] overflow-auto p-0">
            <div className="rounded-xl border border-muted/40 shadow-sm overflow-hidden">
              <Table className="w-full text-[13.5px] md:text-[14px] leading-tight">
                <TableHeader className="sticky top-0 z-10 bg-gradient-to-r from-indigo-600 via-sky-500 to-emerald-500">
                  <TableRow className="border-0">
                    <TableHead className="text-white font-semibold uppercase tracking-wide first:pl-5 py-3">
                      Site ID
                    </TableHead>
                    <TableHead className="text-white font-semibold uppercase tracking-wide py-3">
                      Grid
                    </TableHead>
                    <TableHead className="text-white font-semibold uppercase tracking-wide py-3">
                      District
                    </TableHead>
                    <TableHead className="text-white font-semibold uppercase tracking-wide py-3">
                      Classification
                    </TableHead>
                    <TableHead className="text-white font-semibold uppercase tracking-wide text-right py-3">
                      Complaints
                    </TableHead>
                    <TableHead className="text-white font-semibold uppercase tracking-wide last:pr-5 py-3">
                      Address
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody className="[&>tr]:border-0">
                  {filteredRows.map((r: SiteRow) => (
                    <TableRow
                      key={r.siteId}
                      className="group cursor-pointer even:bg-muted/30 hover:bg-primary/5 transition-colors"
                      onClick={() => {
                        flyToSite(r.siteId);
                        openTrend(r.siteId);
                      }}
                    >
                      <TableCell className="first:pl-5 font-medium">
                        {r.siteId}
                      </TableCell>
                      <TableCell>{r.grid ?? "—"}</TableCell>
                      <TableCell>{r.district ?? "—"}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[12px] font-medium">
                          {r.classification ?? "—"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-semibold">
                        {r.count}
                      </TableCell>
                      <TableCell className="last:pr-5 whitespace-nowrap">
                        {r.address ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))}

                  {!loading && filteredRows.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No rows
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className=" w-full grid gap-4 md:grid-cols-1 xl:grid-cols-2">
        <Card className="h-[420px]">
          <CardHeader>
            <CardTitle>Complaints by Grid</CardTitle>
          </CardHeader>
          <CardContent className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gridChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="grid" />
                <YAxis />
                <RTooltip />
                <Legend />
                <Bar dataKey="count" name="Complaints" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        {/* Removed: Service Title bar chart */}
        {/* Charts */}
        <div className="w-full grid gap-4 md:grid-cols-1 xl:grid-cols-2">
          {/* Left: Grid Bar Chart (unchanged) */}

          {/* Right: District → Complaint Count table */}
          <Card className="h-[420px]">
            <CardHeader>
              <CardTitle>Complaints by District</CardTitle>
            </CardHeader>
            <CardContent className="h-[340px] overflow-auto p-0">
              <div className="rounded-xl border border-muted/40 shadow-sm overflow-hidden">
                <Table className="w-full text-[13px] leading-tight">
                  <TableHeader className="sticky top-0 z-10 bg-gradient-to-r from-sky-500 to-indigo-600">
                    <TableRow className="border-0">
                      <TableHead className="text-white font-semibold uppercase tracking-wide py-2 px-3">
                        District
                      </TableHead>
                      <TableHead className="text-white font-semibold uppercase tracking-wide py-2 px-3 text-right">
                        Complaints
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="[&>tr]:border-0">
                    {districtCounts.map((d) => (
                      <TableRow key={d.district} className="even:bg-muted/30">
                        <TableCell className="px-3">{d.district}</TableCell>
                        <TableCell className="text-right px-3 font-semibold tabular-nums">
                          {d.value}
                        </TableCell>
                      </TableRow>
                    ))}

                    {districtCounts.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={2}
                          className="text-center py-6 text-muted-foreground"
                        >
                          No data
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Trend Dialog */}
      <Dialog
        open={trendOpen}
        onOpenChange={(o: boolean) => {
          setTrendOpen(o);
          if (!o) setTrend(null);
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Complaints Trend — {selectedName ?? "—"}</DialogTitle>
          </DialogHeader>

          {trendLoading && (
            <div className="py-6 text-sm text-muted-foreground">Loading…</div>
          )}
          {trendErr && (
            <div className="py-6 text-sm text-red-600">Error: {trendErr}</div>
          )}

          {!trendLoading && !trendErr && trend && (
            <div className="space-y-4">
              <div className="text-xs text-muted-foreground">
                Total:{" "}
                <span className="font-semibold">
                  {trend.total.toLocaleString()}
                </span>{" "}
                • Range: {trend.from ?? "—"} → {trend.to ?? "—"}
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={trend.series}
                    barSize={28}
                    barCategoryGap="5%"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 10 }}
                      tickMargin={6}
                    />
                    <RTooltip />
                    <Legend />
                    <Bar dataKey="count" name="Complaints" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {topServices.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">
                    Top services:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {topServices.map((s) => (
                      <Badge
                        key={s.name}
                        variant="secondary"
                        className="text-xs font-medium"
                        title={`${s.name} • ${s.value} complaints`}
                      >
                        {s.name}
                        <span className="ml-1 px-1 rounded bg-background/60 text-[10px] tabular-nums">
                          {s.value}
                        </span>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
