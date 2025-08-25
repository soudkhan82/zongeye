// app/availability/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
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
import CsvDownloadButton from "../components/csvdownload";

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

// -------------- Helpers ----------------
const AV_COLOR_MAROON = "#800000"; // 0–50
const AV_COLOR_RED = "#FF0000"; // 51–90
const AV_COLOR_ORANGE = "#FF8C00"; // 91–95
const AV_COLOR_GREEN = "#008000"; // 96–100

export default function AvailabilityPage() {
  const mapRef = useRef<MapRef | null>(null);

  // filters (default subregion = "North-1")
  const [subregions, setSubregions] = useState<string[]>([]);
  const [selectedSubregion, setSelectedSubregion] = useState<string>("North-1");
  const [selectedClass, setSelectedClass] = useState<SiteClass | null>(
    "Platinum"
  );
  const [availRange, setAvailRange] = useState<[number, number]>([0, 100]);
  const [search, setSearch] = useState<string>("");

  // dirty tracking (changes to dropdowns/slider enable the Filter button)
  const [isDirty, setIsDirty] = useState<boolean>(false);

  // data
  const [rows, setRows] = useState<AvailabilityRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // map UI state
  const [hoverInfo, setHoverInfo] = useState<HoverInfo>(null);
  const [selectedInfo, setSelectedInfo] = useState<HoverInfo>(null);

  // table controls
  const [nameInput, setNameInput] = useState<string>("");

  // map initial view (Pakistan-ish)
  const initialViewState = { longitude: 69.3451, latitude: 30.3753, zoom: 4.5 };

  // load subregions once
  useEffect(() => {
    getSubregions().then((subs) => setSubregions(subs ?? []));
  }, []);

  // mark filters as dirty when user changes dropdowns/slider
  useEffect(() => {
    setIsDirty(true);
  }, [selectedSubregion, selectedClass, availRange]);

  // apply filters (manual trigger)
  const applyFilters = useCallback(async () => {
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
      setIsDirty(false);
    }
  }, [selectedSubregion, selectedClass, availRange]);

  // initial fetch with defaults (North-1, 0–100, etc.)
  useEffect(() => {
    void applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // local search (client-side)
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
          geometry: {
            type: "Point",
            coordinates: [r.longitude, r.latitude],
          },
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

  // hover handlers
  const onMouseMove = (e: MapLayerMouseEvent) => {
    if (selectedInfo) return; // suppress hover while selection popup is open
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
    setHoverInfo({ longitude: lng, latitude: lat, props });
  };
  const onLeave = () => setHoverInfo(null);

  // map click -> select + input + popup
  const onMapClick = (e: MapLayerMouseEvent) => {
    const feature: MapGeoJSONFeature | undefined = e.features?.[0];
    if (!feature || feature.geometry.type !== "Point") return;
    const coords = (feature.geometry as GeoJSON.Point).coordinates as [
      number,
      number
    ];
    const props = feature.properties as unknown as FeatureProps | undefined;
    if (!props) return;
    setSelectedInfo({ longitude: coords[0], latitude: coords[1], props });
    setNameInput(String(props.name ?? ""));
    mapRef.current?.flyTo({
      center: coords,
      zoom: 11,
      duration: 900,
    });
  };

  // table row click -> select + input + popup
  const handleRowClick = (r: AvailabilityRow) => {
    setNameInput(r.name);
    setSelectedInfo({
      longitude: r.longitude,
      latitude: r.latitude,
      props: {
        name: r.name,
        availability: r.avg_availability,
        siteclassification: String(r.siteclassification),
        subregion: r.subregion ?? "-",
        grid: r.grid ?? "-",
        address: r.address ?? "-",
      },
    });
    mapRef.current?.flyTo({
      center: [r.longitude, r.latitude],
      zoom: 11,
      duration: 900,
    });
  };

  // open trends
  const openTrend = () => {
    const n = nameInput.trim();
    if (!n) return;
    const url = `/ssl/vitals/${encodeURIComponent(n)}`;
    const w = window.open(url, "_blank", "noopener,noreferrer");
    if (w) w.opener = null;
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
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
        <div>
          <Label className="mb-1 block">SubRegion</Label>
          <Select
            onValueChange={(v) => setSelectedSubregion(v)}
            value={selectedSubregion}
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

        <div>
          <Label className="mb-1 block">Site Classification</Label>
          <Select
            onValueChange={(v) => setSelectedClass(v as SiteClass)}
            value={selectedClass ?? ""}
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
            Availability Range: {availRange[0]}% – {availRange[1]}%
          </Label>
          <Slider
            min={0}
            max={100}
            step={1}
            value={availRange}
            onValueChange={(v) =>
              setAvailRange([v[0] ?? 0, v[1] ?? 100] as [number, number])
            }
          />
        </div>

        {/* Buttons: Filter + Clear side by side */}
        <div className="flex items-end">
          <Button
            onClick={() => void applyFilters()}
            className="w-full"
            disabled={!isDirty && rows.length > 0}
            title="Apply filters"
          >
            Filter
          </Button>
        </div>
        <div className="flex items-end">
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => {
              setSelectedSubregion("North-1"); // reset to default
              setSelectedClass(null);
              setAvailRange([0, 100]);
              setSearch("");
              setNameInput("");
              setSelectedInfo(null);
              setIsDirty(true);
            }}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Map + Table */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Map */}
        <Card className="col-span-1 xl:col-span-2 overflow-hidden p-4">
          <div className="h-[600px] rounded-lg overflow-hidden">
            <Map
              ref={mapRef}
              initialViewState={initialViewState}
              mapLib={maplibregl}
              mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
              interactiveLayerIds={["availability-circles"]}
              onMouseMove={onMouseMove}
              onMouseLeave={onLeave}
              onClick={onMapClick}
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
                      6,
                      4.5,
                      8,
                      6,
                      10,
                      8,
                      12,
                      10,
                      14,
                      12,
                    ],
                    "circle-stroke-color": "#ffffff",
                    "circle-stroke-width": 0.6,
                    "circle-opacity": 0.9,
                    // Color by availability thresholds:
                    // 0–50 maroon, 51–90 red, 91–95 orange, 96–100 green
                    "circle-color": [
                      "step",
                      ["get", "availability"],
                      AV_COLOR_MAROON, // < 51
                      51,
                      AV_COLOR_RED, // 51–90
                      91,
                      AV_COLOR_ORANGE, // 91–95
                      96,
                      AV_COLOR_GREEN, // 96–100
                    ],
                  }}
                />
              </Source>

              {/* Selected popup */}
              {selectedInfo && (
                <Popup
                  longitude={selectedInfo.longitude}
                  latitude={selectedInfo.latitude}
                  anchor="top"
                  closeButton
                  onClose={() => setSelectedInfo(null)}
                >
                  <div className="text-sm">
                    <div className="font-semibold">
                      {selectedInfo.props.name}
                    </div>
                    <div>
                      Availability:{" "}
                      <span className="font-medium">
                        {selectedInfo.props.availability.toFixed(2)}%
                      </span>
                    </div>
                    <div>Class: {selectedInfo.props.siteclassification}</div>
                    <div>SubRegion: {selectedInfo.props.subregion}</div>
                    <div>Grid: {selectedInfo.props.grid}</div>
                    <div>Address: {selectedInfo.props.address}</div>
                    <Button
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        const url = `/ssl/vitals/${encodeURIComponent(
                          selectedInfo!.props.name
                        )}`;
                        const w = window.open(
                          url,
                          "_blank",
                          "noopener,noreferrer"
                        );
                        if (w) w.opener = null;
                      }}
                    >
                      Open Trend
                    </Button>
                  </div>
                </Popup>
              )}

              {/* Hover popup when nothing is selected */}
              {!selectedInfo && hoverInfo && (
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

          {/* Availability legend */}
          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            <LegendItem color={AV_COLOR_MAROON} label="0–50 (Maroon)" />
            <LegendItem color={AV_COLOR_RED} label="51–90 (Red)" />
            <LegendItem color={AV_COLOR_ORANGE} label="91–95 (Orange)" />
            <LegendItem color={AV_COLOR_GREEN} label="96–100 (Green)" />
          </div>
        </Card>

        {/* Table */}
        <Card className="col-span-1 p-4">
          {/* Selected site + actions */}
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <div className="flex-1">
              <Label className="mb-1 block">Selected Site</Label>
              <Input
                placeholder="Click a row or marker…"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
              />
            </div>
            <div className="flex gap-2 items-end">
              <Button
                onClick={openTrend}
                disabled={!nameInput.trim()}
                title="Open site trends"
              >
                Open Trend
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">
              Plotted Sites ({filtered.length})
            </h2>
            {loading && (
              <span className="text-sm text-muted-foreground">Loading…</span>
            )}
          </div>
          <CsvDownloadButton
            data={filtered}
            filename={`availability_${selectedSubregion || "all"}_${
              availRange[0]
            }-${availRange[1]}_${new Date().toISOString().slice(0, 10)}.csv`}
            title="Download the table rows as CSV"
            // Keep the CSV numeric but nicely formatted for availability:
            columns={[
              { header: "Name", accessor: "name" as const },
              {
                header: "Availability %",
                accessor: (r) => r.avg_availability,
                format: (v) => Number(v).toFixed(2),
              },
              { header: "Class", accessor: "siteclassification" as const },
              { header: "SubRegion", accessor: "subregion" as const },
              { header: "Grid", accessor: "grid" as const },
              { header: "Address", accessor: "address" as const },
              { header: "Latitude", accessor: "latitude" as const },
              { header: "Longitude", accessor: "longitude" as const },
            ]}
            disabled={loading || filtered.length === 0}
          >
            Download CSV
          </CsvDownloadButton>

          {/* Quick search */}
          <div className="mb-2">
            <Label className="mb-1 block">Search (Name/Grid/Address)</Label>
            <Input
              placeholder="e.g., Lahore, SGRID-12, Site-001"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="border rounded-xl bg-white shadow overflow-auto max-h-[500px]">
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
                    onClick={() => handleRowClick(r)}
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
    </div>
  );
}

// ------- Small legend chip component -------
function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="inline-block h-3 w-3 rounded-sm border border-black/10"
        style={{ backgroundColor: color }}
      />
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}
