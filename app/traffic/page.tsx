// app/traffic/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchSitesWithTraffic, type TrafficRow } from "@/app/actions/traffic";
import { getSubregions, getDistricts, getGrids } from "@/app/actions/filters";
import maplibregl from "maplibre-gl";
import Map, { Marker, Popup } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

// Shadcn UI
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

type Range = { min: number; max: number };

export default function TrafficPage() {
  const [subregions, setSubregions] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [grids, setGrids] = useState<string[]>([]);
  const [hovered, setHovered] = useState<{
    lat: number;
    lng: number;
    row: TrafficRow;
  } | null>(null);
  const [subregion, setSubregion] = useState<string>("North-1");
  const [district, setDistrict] = useState<string>("");
  const [grid, setGrid] = useState<string>("");

  const [voiceRange, setVoiceRange] = useState<Range>({ min: 0, max: 100000 });
  const [dataRange, setDataRange] = useState<Range>({ min: 0, max: 100000 });

  const [rows, setRows] = useState<TrafficRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [viewState, setViewState] = useState({
    latitude: 30.3753,
    longitude: 69.3451,
    zoom: 5,
  });
  const fmt = (n: number | null | undefined) =>
    n == null ? "-" : Math.round(n).toLocaleString();
  // Load subregions once
  useEffect(() => {
    (async () => {
      const list = await getSubregions();
      setSubregions(["ALL", ...list]);
    })();
  }, []);

  // SubRegions
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const list = await getSubregions();
      if (cancelled) return;
      setSubregions(list);
      if (list.length && !list.includes("North-1")) {
        setSubregion(list[0]); // fallback if "North-1" doesn’t exist
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  //Disrict
  useEffect(() => {
    if (!subregion) return;
    let cancelled = false;
    (async () => {
      const d = await getDistricts(subregion);
      if (cancelled) return;
      setDistricts(d);
      setDistrict(""); // user must pick a district
      setGrids([]); // reset grids because district changed
      setGrid(""); // no default
    })();
    return () => {
      cancelled = true;
    };
  }, [subregion]);

  //Disrict
  useEffect(() => {
    let cancelled = false;
    if (!district) {
      setGrids([]);
      setGrid("");
      return;
    }
    (async () => {
      const g = await getGrids(subregion, district);
      if (cancelled) return;
      setGrids(g);
      setGrid(""); // user must pick a grid (still optional in fetch)
    })();
    return () => {
      cancelled = true;
    };
  }, [district, subregion]);

  const fetchNow = async () => {
    setLoading(true);
    try {
      const data = await fetchSitesWithTraffic({
        subregion,
        district: district || null,
        grid: grid || null,
        voiceRange,
        dataRange,
      });
      setRows(data ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Points = one per site (already averaged by SQL)
  const mapPoints = useMemo(
    () => rows.filter((r) => r.Latitude != null && r.Longitude != null),
    [rows]
  );

  // Recenter when results change
  useEffect(() => {
    if (mapPoints.length === 0) {
      setViewState({ latitude: 30.3753, longitude: 69.3451, zoom: 5 });
      return;
    }
    const lat =
      mapPoints.reduce((s, r) => s + (r.Latitude ?? 0), 0) / mapPoints.length;
    const lng =
      mapPoints.reduce((s, r) => s + (r.Longitude ?? 0), 0) / mapPoints.length;
    setViewState((vs) => ({ ...vs, latitude: lat, longitude: lng, zoom: 6 }));
  }, [mapPoints]);

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">
        Traffic Explorer (Averaged per Site)
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Subregion */}
          <div>
            <label className="block mb-2 text-sm font-medium">Subregion</label>
            <Select value={subregion} onValueChange={setSubregion}>
              <SelectTrigger>
                <SelectValue placeholder="Select Subregion" />
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

          {/* District */}
          <div>
            <label className="block mb-2 text-sm font-medium">District</label>
            <Select
              value={district}
              onValueChange={setDistrict}
              disabled={subregion === ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select District" />
              </SelectTrigger>
              <SelectContent>
                {districts.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Grid */}
          <div>
            <label className="block mb-2 text-sm font-medium">Grid</label>
            <Select
              value={grid}
              onValueChange={setGrid}
              disabled={subregion === ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Grid" />
              </SelectTrigger>
              <SelectContent>
                {grids.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Voice Range (SQL-averaged totals) */}
          <div className="md:col-span-3">
            <label className="block mb-2 text-sm font-medium">
              Voice Range (avg)
            </label>
            <div className="flex items-center gap-4">
              <span className="w-20 text-sm">
                {voiceRange.min.toLocaleString()}
              </span>
              <Slider
                value={[voiceRange.min, voiceRange.max]}
                min={0}
                max={200000}
                step={1000}
                onValueChange={(v) => setVoiceRange({ min: v[0], max: v[1] })}
              />
              <span className="w-20 text-sm text-right">
                {voiceRange.max.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Data Range (SQL-averaged totals) */}
          <div className="md:col-span-3">
            <label className="block mb-2 text-sm font-medium">
              Data Range (avg)
            </label>
            <div className="flex items-center gap-4">
              <span className="w-20 text-sm">
                {dataRange.min.toLocaleString()}
              </span>
              <Slider
                value={[dataRange.min, dataRange.max]}
                min={0}
                max={500000}
                step={1000}
                onValueChange={(v) => setDataRange({ min: v[0], max: v[1] })}
              />
              <span className="w-20 text-sm text-right">
                {dataRange.max.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="md:col-span-3 flex justify-end">
            <Button onClick={fetchNow} disabled={loading}>
              {loading ? "Loading..." : "Apply Filters"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Map + Table */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="h-[520px]">
          <CardHeader>
            <CardTitle>Map</CardTitle>
          </CardHeader>
          <CardContent className="h-[460px]">
            <Map
              mapLib={maplibregl}
              mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
              style={{ width: "100%", height: "100%" }}
              {...viewState}
              onMove={(evt) => setViewState(evt.viewState)}
            >
              {mapPoints.map((p) => (
                <Marker
                  key={p.Name}
                  latitude={p.Latitude!}
                  longitude={p.Longitude!}
                  anchor="bottom"
                >
                  <div
                    title={`${p.Name} • ${p.SiteClassification ?? ""}`}
                    className="w-3 h-3 rounded-full bg-green-600 border border-white shadow"
                    onMouseEnter={() =>
                      setHovered({
                        lat: p.Latitude!,
                        lng: p.Longitude!,
                        row: p,
                      })
                    }
                    onMouseLeave={() => setHovered(null)}
                  />
                </Marker>
              ))}

              {hovered && (
                <Popup
                  latitude={hovered.lat}
                  longitude={hovered.lng}
                  closeButton={false}
                  closeOnClick={false}
                  anchor="top"
                  offset={10}
                  onClose={() => setHovered(null)}
                >
                  <div className="text-sm">
                    <div className="font-semibold">{hovered.row.Name}</div>
                    <div className="text-xs text-muted-foreground">
                      Grid: {hovered.row.Grid ?? "-"} • District:{" "}
                      {hovered.row.District ?? "-"}
                    </div>
                    <div className="mt-1">
                      <div>
                        Avg Voice:{" "}
                        <span className="font-medium">
                          {fmt(hovered.row.voice_total)}
                        </span>
                      </div>
                      <div>
                        Avg Data:{" "}
                        <span className="font-medium">
                          {fmt(hovered.row.data_total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Popup>
              )}
            </Map>
          </CardContent>
        </Card>

        <Card className="h-[520px]">
          <CardHeader>
            <CardTitle>Results ({rows.length})</CardTitle>
          </CardHeader>
          <CardContent className="h-[460px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Name</TableHead>
                  <TableHead>SubRegion</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Grid</TableHead>
                  <TableHead>SiteClass.</TableHead>
                  <TableHead className="text-right">Avg Voice</TableHead>
                  <TableHead className="text-right">Avg Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.Name}>
                    <Link href={`/ssl/vitals/${r.Name}`}>
                      <TableCell className="font-medium">{r.Name}</TableCell>
                    </Link>

                    <TableCell>{r.SubRegion}</TableCell>
                    <TableCell>{r.District ?? "-"}</TableCell>
                    <TableCell>{r.Grid ?? "-"}</TableCell>
                    <TableCell>{r.SiteClassification ?? "-"}</TableCell>
                    <TableCell className="text-right">
                      {Math.round(r.voice_total ?? 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {Math.round(r.data_total ?? 0).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
