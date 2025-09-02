"use client";

import { useEffect, useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { getSubregions } from "@/app/actions/filters";
import { getDistricts } from "@/app/actions/rt";
// import { getLatestPoints } from "@/app/actions/gis";

import PointSizeMap, {
  MapPoint as SizeMapPoint,
  KpiKey,
} from "@/app/gis/components/PointSizeMap";
import { getLatestPoints } from "../actions/gis";

type LatestKpiRow = {
  Name: string;
  Region: string | null;
  SubRegion: string | null;
  District: string | null;
  Grid: string | null;
  Address: string | null;
  SiteClassification: string | null;
  Longitude: number | null;
  Latitude: number | null;
  Month: string | null;
  MFULTotalRev: number | string | null;
  MFULDataRev: number | string | null;
  MFULVoiceRev: number | string | null;
  data4GTrafficGB: number | string | null;
  data3GTrafficGB: number | string | null;
  voice2GTrafficE: number | string | null;
  voice3GTrafficE: number | string | null;
  voLTEVoiceTrafficE: number | string | null;
};

const KPI_OPTIONS: { key: KpiKey; label: string }[] = [
  { key: "MFULTotalRev", label: "Total Revenue" },
  { key: "MFULDataRev", label: "Data Revenue" },
  { key: "MFULVoiceRev", label: "Voice Revenue" },
  { key: "data4GTrafficGB", label: "4G Data (GB)" },
  { key: "data3GTrafficGB", label: "3G Data (GB)" },
  { key: "voice2GTrafficE", label: "Voice 2G (Erl)" },
  { key: "voice3GTrafficE", label: "Voice 3G (Erl)" },
  { key: "voLTEVoiceTrafficE", label: "VoLTE (Erl)" },
];

const KPI_LABELS = Object.fromEntries(KPI_OPTIONS.map((o) => [o.key, o.label]));

const num = (v: number | string | null | undefined) => {
  if (v === null || v === undefined) return NaN;
  if (typeof v === "number") return v;
  const n = Number(String(v).replace(/[, ]/g, ""));
  return Number.isFinite(n) ? n : NaN;
};

const fmt = (v: number) =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(v);

export default function VoiceTrafficPage() {
  const [selectedSubRegion, setSelectedSubRegion] = useState<string>("North-1");
  const [selDistrict, setSelDistrict] = useState<string>("");

  const [subregionOptions, setSubregionOptions] = useState<string[]>([]);
  const [districtOptions, setDistrictOptions] = useState<string[]>([]);
  const [kpiKey, setKpiKey] = useState<KpiKey>("MFULTotalRev");

  const [loading, setLoading] = useState(false);
  const [points, setPoints] = useState<SizeMapPoint[]>([]);

  // NEW: focus state for map flyTo on row click
  const [focusPoint, setFocusPoint] = useState<
    { lng: number; lat: number; zoom?: number } | undefined
  >(undefined);

  // Load subregions once
  useEffect(() => {
    getSubregions().then(setSubregionOptions).catch(console.error);
  }, []);

  // When subregion changes, load districts
  useEffect(() => {
    (async () => {
      setSelDistrict("");
      if (!selectedSubRegion) {
        setDistrictOptions([]);
        return;
      }
      try {
        const d = await getDistricts(selectedSubRegion);
        setDistrictOptions(d);
      } catch (e) {
        console.error("Failed to load districts", e);
        setDistrictOptions([]);
      }
    })();
  }, [selectedSubRegion]);

  // Fetch latest points based on filters
  const loadPoints = async () => {
    setLoading(true);
    try {
      const data = (await getLatestPoints(
        selectedSubRegion || undefined,
        selDistrict || undefined
      )) as LatestKpiRow[];

      const mapped: SizeMapPoint[] = data.map((r) => ({
        Name: r.Name,
        SubRegion: r.SubRegion,
        District: r.District,
        Grid: r.Grid,
        SiteClassification: r.SiteClassification,
        Longitude: r.Longitude,
        Latitude: r.Latitude,
        Address: r.Address,
        MFULTotalRev: r.MFULTotalRev,
        MFULDataRev: r.MFULDataRev,
        MFULVoiceRev: r.MFULVoiceRev,
        data4GTrafficGB: r.data4GTrafficGB,
        data3GTrafficGB: r.data3GTrafficGB,
        voice2GTrafficE: r.voice2GTrafficE,
        voice3GTrafficE: r.voice3GTrafficE,
        voLTEVoiceTrafficE: r.voLTEVoiceTrafficE,
        Month: r.Month,
      }));

      setPoints(mapped);
    } catch (e) {
      console.error(e);
      setPoints([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadPoints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canApply = useMemo(
    () => !!selectedSubRegion || !!selDistrict,
    [selectedSubRegion, selDistrict]
  );

  // Build the sorted table rows whenever points or KPI changes
  const sortedRows = useMemo(() => {
    const rows = points
      .map((p) => ({ ...p, _value: num(p[kpiKey]) }))
      .filter((p) => Number.isFinite(p._value))
      .sort((a, b) => (b._value as number) - (a._value as number));
    return rows;
  }, [points, kpiKey]);

  // Small badge color helper for SiteClassification
  const badgeForClass = (sc?: string | null) => {
    const s = (sc || "").toLowerCase();
    if (s.includes("platinum")) return "bg-emerald-100 text-emerald-800";
    if (s.includes("gold")) return "bg-amber-100 text-amber-800";
    if (s.includes("strategic")) return "bg-indigo-100 text-indigo-800";
    if (s.includes("silver")) return "bg-slate-100 text-slate-800";
    if (s.includes("bronze")) return "bg-orange-100 text-orange-800";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <div className="w-full p-4 space-y-4">
      <h1 className="text-2xl font-bold text-center my-6 text-indigo-700">
        Metrices — Point Size Map
      </h1>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
        <div className="space-y-1">
          <Label>SubRegion</Label>
          <Select
            value={selectedSubRegion}
            onValueChange={(v) => {
              setSelectedSubRegion(v);
              setSelDistrict("");
            }}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select subregion" />
            </SelectTrigger>
            <SelectContent>
              {subregionOptions.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>District</Label>
          <Select
            value={selDistrict}
            onValueChange={setSelDistrict}
            disabled={!selectedSubRegion}
          >
            <SelectTrigger className="w-64">
              <SelectValue
                placeholder={
                  selectedSubRegion
                    ? "Select district"
                    : "Select subregion first"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {districtOptions.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* KPI selector */}
        <div className="space-y-1">
          <Label>Size by Metric</Label>
          <Select value={kpiKey} onValueChange={(v) => setKpiKey(v as KpiKey)}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select KPI" />
            </SelectTrigger>
            <SelectContent>
              {KPI_OPTIONS.map(({ key, label }) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="opacity-0">Apply</Label>
          <Button onClick={loadPoints} disabled={loading || !canApply}>
            {loading ? "Loading..." : "Apply Filters"}
          </Button>
        </div>
      </div>

      {/* Map + KPI Table side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Map */}
        <div className="h-[72vh] rounded-xl border overflow-hidden bg-muted/20">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              Loading latest KPI points…
            </div>
          ) : (
            <PointSizeMap
              points={points}
              kpiKey={kpiKey}
              focusPoint={focusPoint}
            />
          )}
        </div>

        {/* KPI Table */}
        <div className="h-[72vh] rounded-xl border overflow-hidden flex flex-col">
          <div className="p-3 border-b bg-muted/30">
            <div className="text-sm text-muted-foreground">
              Sorted by{" "}
              <span className="font-medium">{KPI_LABELS[kpiKey]}</span>{" "}
              (descending)
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <Table className="w-full">
              <TableCaption className="mt-0">
                Top {Math.min(sortedRows.length, 100)} sites by{" "}
                {KPI_LABELS[kpiKey]}
              </TableCaption>

              {/* Sticky header with subtle shadow */}
              <TableHeader className="sticky top-0 bg-slate-200 z-10 shadow-sm">
                <TableRow>
                  <TableHead className="w-14 font-bold">#</TableHead>
                  <TableHead className="font-bold">Site</TableHead>
                  <TableHead className="font-bold">Class</TableHead>
                  <TableHead className="font-bold">District</TableHead>
                  <TableHead className="font-bold">SubRegion</TableHead>
                  <TableHead className="text-right font-bold">
                    {KPI_LABELS[kpiKey]}
                  </TableHead>
                  <TableHead className="text-right font-bold">Month</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {sortedRows.slice(0, 100).map((row, idx) => {
                  const v = num(row[kpiKey]);
                  const canFly =
                    typeof row.Longitude === "number" &&
                    typeof row.Latitude === "number";

                  return (
                    <TableRow
                      key={`${row.Name}-${idx}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        if (canFly) {
                          setFocusPoint({
                            lng: row.Longitude as number,
                            lat: row.Latitude as number,
                            zoom: 12, // adjust as you like
                          });
                        }
                      }}
                      onKeyDown={(e) => {
                        if ((e.key === "Enter" || e.key === " ") && canFly) {
                          setFocusPoint({
                            lng: row.Longitude as number,
                            lat: row.Latitude as number,
                            zoom: 12,
                          });
                        }
                      }}
                      className={[
                        "cursor-pointer transition-colors",
                        "hover:bg-indigo-50/60 focus:bg-indigo-50",
                        "even:bg-muted/20", // zebra stripe
                        canFly ? "group" : "opacity-60",
                      ].join(" ")}
                    >
                      <TableCell className="font-mono">{idx + 1}</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span className="truncate max-w-[14rem]">
                            {row.Name}
                          </span>
                          {canFly && (
                            <span className="text-xs text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                              Zoom
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badgeForClass(
                            row.SiteClassification
                          )}`}
                          title={row.SiteClassification ?? ""}
                        >
                          {row.SiteClassification ?? "—"}
                        </span>
                      </TableCell>
                      <TableCell className="truncate max-w-[10rem]">
                        {row.District ?? "—"}
                      </TableCell>
                      <TableCell className="truncate max-w-[10rem]">
                        {row.SubRegion ?? "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {Number.isFinite(v) ? fmt(v as number) : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {row.Month ?? "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}

                {sortedRows.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6">
                      No data to display.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Subtle footer hint */}
          <div className="p-2 text-xs text-muted-foreground border-t">
            Tip: Click a row to zoom to that site on the map.
          </div>
        </div>
      </div>
    </div>
  );
}
