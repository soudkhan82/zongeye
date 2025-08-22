"use client";
import { circleColorBySiteClass, colorForSiteClass } from "@/lib/mapColors";
import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl, {
  type MapLayerMouseEvent,
  type MapGeoJSONFeature,
} from "maplibre-gl";
import Map, { MapRef, Source, Layer, Popup } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import { getAvailabilityPoints } from "@/app/actions/avail";
import { getSubregions } from "@/app/actions/filters";

// ❌ removed: import TrendsClientMany from "../ssl/components/TrendClientMany";

// ---------------- Types ----------------

type SiteClass = "Platinum" | "Gold" | "Strategic" | "Silver" | "Bronze";

type AvailabilityRow = {
  name: string;
  subregion: string | null;
  siteclassification: SiteClass | string;
  grid: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  avg_availability: number; // 0..100
};

type FeatureProps = {
  name: string;
  availability: number;
  siteclassification: string;
  subregion: string;
  grid: string;
  address: string;
};

type HoverInfo = {
  longitude: number;
  latitude: number;
  props: FeatureProps;
} | null;

type FeatureCollectionPoint<P = FeatureProps> = GeoJSON.FeatureCollection<
  GeoJSON.Point,
  P
>;

// CSV utils
function csvEscape(v: unknown): string {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(rows: AvailabilityRow[]): string {
  const headers = [
    "Name",
    "Availability %",
    "Class",
    "SubRegion",
    "Grid",
    "Address",
    "Latitude",
    "Longitude",
  ];
  const headerLine = headers.map(csvEscape).join(",");

  const lines = rows.map((r) =>
    [
      r.name,
      typeof r.avg_availability === "number"
        ? r.avg_availability.toFixed(2)
        : "",
      r.siteclassification ?? "",
      r.subregion ?? "",
      r.grid ?? "",
      r.address ?? "",
      r.latitude,
      r.longitude,
    ]
      .map(csvEscape)
      .join(",")
  );

  return [headerLine, ...lines].join("\n");
}

function downloadCsv(rows: AvailabilityRow[]) {
  const csv = toCsv(rows);
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const fname = `availability_${now.getFullYear()}-${pad(
    now.getMonth() + 1
  )}-${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}.csv`;

  const a = document.createElement("a");
  a.href = url;
  a.download = fname;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// -------------- Component --------------

export default function AvailabilityPage() {
  const mapRef = useRef<MapRef | null>(null);

  // options
  const [subregions, setSubregions] = useState<string[]>([]);

  // 🔧 UI (pending) filters
  const [pendingSubregion, setPendingSubregion] = useState<string | null>(null);
  const [pendingClass, setPendingClass] = useState<SiteClass | null>(null);
  const [pendingRange, setPendingRange] = useState<[number, number]>([0, 100]);
  const [nameInput, setNameInput] = useState<string>("");

  // ✅ Applied filters (used to fetch)
  const [selectedSubregion, setSelectedSubregion] = useState<string | null>(
    null
  );
  const [selectedClass, setSelectedClass] = useState<SiteClass | null>(null);
  const [availRange, setAvailRange] = useState<[number, number]>([0, 100]);

  // local search (client-side only)
  const [search, setSearch] = useState<string>("");

  // data / states
  const [rows, setRows] = useState<AvailabilityRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hoverInfo, setHoverInfo] = useState<HoverInfo>(null);

  // map initial view (Pakistan-ish)
  const initialViewState = { longitude: 69.3451, latitude: 30.3753, zoom: 4.5 };

  // load subregions once
  useEffect(() => {
    getSubregions().then((subs) => setSubregions(subs ?? []));
  }, []);

  // fetch points WHEN APPLIED FILTERS CHANGE
  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const data = await getAvailabilityPoints(
          selectedSubregion ?? undefined,
          selectedClass ?? undefined,
          availRange[0],
          availRange[1]
        );
        setRows(
          (data ?? []).map((r: AvailabilityRow) => ({
            name: r.name,
            subregion: r.subregion ?? null,
            siteclassification: r.siteclassification,
            grid: r.grid ?? null,
            address: r.address ?? null,
            latitude: Number(r.latitude),
            longitude: Number(r.longitude),
            avg_availability: Number(r.avg_availability),
          }))
        );
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [selectedSubregion, selectedClass, availRange]);

  // ▶️ Apply button handler
  const applyFilters = () => {
    setSelectedSubregion(pendingSubregion);
    setSelectedClass(pendingClass);
    setAvailRange(pendingRange);
  };

  // 🔄 Clear filters (resets both UI + applied, triggers fetch via effect)
  const clearFilters = () => {
    setPendingSubregion(null);
    setPendingClass(null);
    setPendingRange([0, 100]);
    setSearch("");
    setSelectedSubregion(null);
    setSelectedClass(null);
    setAvailRange([0, 100]);
  };

  // local search
  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(
      (r) =>
        (r.name?.toLowerCase() ?? "").includes(q) ||
        (r.grid?.toLowerCase() ?? "").includes(q) ||
        (r.address?.toLowerCase() ?? "").includes(q)
    );
  }, [rows, search]);

  // ✅ Build trends link with repeated ?name= params (capped)

  // GeoJSON
  const geojson: FeatureCollectionPoint = useMemo(
    () => ({
      type: "FeatureCollection",
      features: filtered
        .filter(
          (r) => Number.isFinite(r.latitude) && Number.isFinite(r.longitude)
        )
        .map<GeoJSON.Feature<GeoJSON.Point, FeatureProps>>((r) => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: [r.longitude, r.latitude] },
          properties: {
            name: r.name,
            availability: r.avg_availability,
            siteclassification: String(r.siteclassification),
            subregion: r.subregion ?? "-",
            grid: r.grid ?? "-",
            address: r.address ?? "-",
          },
        })),
    }),
    [filtered]
  );

  // hover handlers (typed)
  const onMouseMove = (e: MapLayerMouseEvent) => {
    const feature: MapGeoJSONFeature | undefined = e.features?.[0];
    if (!feature || feature.geometry.type !== "Point") {
      setHoverInfo(null);
      return;
    }
    const coords = (feature.geometry as GeoJSON.Point).coordinates;
    const props = feature.properties as unknown as FeatureProps | undefined;

    if (!props || !Array.isArray(coords) || coords.length < 2) {
      setHoverInfo(null);
      return;
    }
    const [lng, lat] = coords as [number, number];
    setHoverInfo({
      longitude: lng,
      latitude: lat,
      props: {
        name: String(props.name),
        availability: Number(props.availability),
        siteclassification: String(props.siteclassification),
        subregion: String(props.subregion),
        grid: String(props.grid),
        address: String(props.address),
      },
    });
  };
  const onLeave = () => setHoverInfo(null);

  // row click → fly to
  const flyTo = (r: AvailabilityRow) => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: [r.longitude, r.latitude],
      zoom: 10,
      duration: 900,
    });
  };

  const classes: SiteClass[] = [
    "Platinum",
    "Gold",
    "Strategic",
    "Silver",
    "Bronze",
  ];

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Availability Geo View</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
        <div className="md:col-span-1">
          <Label className="mb-1 block">SubRegion</Label>
          <Select
            onValueChange={(v) => setPendingSubregion(v)}
            value={pendingSubregion ?? ""}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a subregion" />
            </SelectTrigger>
            <SelectContent>
              {subregions.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-1">
          <Label className="mb-1 block">Site Classification</Label>
          <Select
            onValueChange={(v) => setPendingClass(v as SiteClass)}
            value={pendingClass ?? ""}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All classes" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2">
          <Label className="mb-1 block">
            Availability Range: {pendingRange[0]}% – {pendingRange[1]}%
          </Label>
          <Slider
            min={0}
            max={100}
            step={1}
            value={pendingRange}
            onValueChange={(v) =>
              setPendingRange([v[0] ?? 0, v[1] ?? 100] as [number, number])
            }
          />
        </div>

        <div className="md:col-span-1">
          <Label className="mb-1 block">Search (Name/Grid/Address)</Label>
          <Input
            placeholder="e.g., Lahore, SGRID-12, Site-001"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* ➕ Apply / Clear */}
        <div className="flex gap-2 md:col-span-1">
          <Button onClick={applyFilters} disabled={loading} className="w-full">
            {loading ? "Applying…" : "Apply Filters"}
          </Button>
          <Button
            variant="secondary"
            onClick={clearFilters}
            disabled={loading}
            className="w-full"
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Map + Table */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Map */}
        <Card className="col-span-1 xl:col-span-2 overflow-hidden">
          <div className="h-[600px]">
            <Map
              ref={mapRef}
              initialViewState={initialViewState}
              mapLib={maplibregl}
              mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
              interactiveLayerIds={["availability-circles"]}
              onMouseMove={onMouseMove}
              onMouseLeave={onLeave}
            >
              <Source id="availability" type="geojson" data={geojson}>
                <Layer
                  id="availability-circles"
                  type="circle"
                  paint={{
                    "circle-radius": [
                      "interpolate",
                      ["linear"],
                      ["zoom"],
                      4,
                      3,
                      8,
                      6,
                      12,
                      9,
                      14,
                      12,
                    ],
                    "circle-stroke-color": "#ffffff",
                    "circle-stroke-width": 1,
                    "circle-opacity": 0.9,
                    "circle-color": circleColorBySiteClass(),
                  }}
                />
              </Source>

              {hoverInfo && (
                <Popup
                  longitude={hoverInfo.longitude}
                  latitude={hoverInfo.latitude}
                  anchor="top"
                  closeButton={false}
                >
                  <div className="text-sm">
                    <div className="font-semibold">{hoverInfo.props.name}</div>
                    <div>
                      Availability:{" "}
                      <span className="font-medium">
                        {hoverInfo.props.availability.toFixed(2)}%
                      </span>
                    </div>
                    <div>Class: {hoverInfo.props.siteclassification}</div>
                    <div>SubRegion: {hoverInfo.props.subregion}</div>
                    <div>Grid: {hoverInfo.props.grid}</div>
                    <div>Address: {hoverInfo.props.address}</div>
                  </div>
                </Popup>
              )}
            </Map>
          </div>
        </Card>

        {/* Table */}
        <Card className="col-span-1 p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">
              Plotted Sites ({filtered.length})
            </h2>
            <div className="flex items-center gap-2">
              {loading && (
                <span className="text-sm text-muted-foreground">Loading…</span>
              )}

              {/* ✅ Open Trends Page (disabled if no rows) */}
            </div>
          </div>

          <div className="border rounded-xl bg-white shadow overflow-auto max-h-[560px]">
            {/* CSV download for current table */}
            <div className="p-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadCsv(filtered)}
                disabled={filtered.length === 0 || loading}
                title="Download current table as CSV"
              >
                Download CSV
              </Button>
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label className="mb-1 block">Open single-site trends</Label>
                <Input
                  placeholder="Type or click a row to autofill site name…"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                />
              </div>
              <Button
                className="mt-6"
                onClick={() => {
                  const n = nameInput.trim();
                  if (!n) return;
                  window.open(
                    `/ssl/vitals/${encodeURIComponent(nameInput.trim())}`,
                    "_blank",
                    "noopener,noreferrer"
                  );
                }}
                disabled={!nameInput.trim()}
                title="Open TrendClient for this site"
              >
                Open Trend
              </Button>
            </div>
            <Table>
              <TableHeader className="bg-blue-100 text-blue-900 sticky top-0 z-10">
                <TableRow>
                  <TableHead className="font-bold">Name</TableHead>
                  <TableHead className="font-bold">Availability %</TableHead>
                  <TableHead className="font-bold">Class</TableHead>
                  <TableHead className="font-bold">SubRegion</TableHead>
                  <TableHead className="font-bold">Grid</TableHead>
                  <TableHead className="font-bold">Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow
                    key={`${r.name}-${r.grid ?? ""}`}
                    className="cursor-pointer hover:bg-blue-50"
                    onClick={() => {
                      flyTo(r);
                      setNameInput(r.name);
                    }}
                  >
                    <TableCell className="whitespace-nowrap">
                      {r.name}
                    </TableCell>

                    <TableCell>{r.avg_availability.toFixed(2)}</TableCell>
                    <TableCell>{r.siteclassification}</TableCell>
                    <TableCell>{r.subregion ?? "-"}</TableCell>
                    <TableCell>{r.grid ?? "-"}</TableCell>
                    <TableCell>{r.address ?? "-"}</TableCell>
                  </TableRow>
                ))}
                {!loading && filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      No results
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 pt-2 flex-wrap">
        <div className="text-sm font-medium">Legend:</div>
        {classes.map((c) => (
          <div className="flex items-center gap-2" key={c}>
            <span
              className="w-3 h-3 rounded-full border"
              style={{ backgroundColor: colorForSiteClass(c) }}
            />
            <span className="text-sm">{c}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
