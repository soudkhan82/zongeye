"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  getSslDashboard,
  type ClassCount,
  type SslRow,
} from "@/app/actions/ssl";
// ← use your existing function

// MapLibre
import maplibregl from "maplibre-gl";
import Map, { Marker, MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

// shadcn/ui
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

// recharts
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  Legend as ReLegend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { get_regions } from "@/app/actions/filters";

const CLASS_COLORS: Record<ClassCount["name"], string> = {
  Platinum: "#60A5FA",
  Gold: "#F59E0B",
  Strategic: "#22C55E",
  Silver: "#94A3B8",
  Bronze: "#B45309",
};

export default function SslDashboardPage() {
  const [region, setRegion] = useState<string | undefined>(undefined);
  const [regions, setRegions] = useState<string[]>([]);

  const [classCounts, setClassCounts] = useState<ClassCount[]>([]);
  const [subregionCounts, setSubregionCounts] = useState<
    { subregion: string | null; value: number }[]
  >([]);
  const [sites, setSites] = useState<SslRow[]>([]);
  const [loading, setLoading] = useState(false);

  const mapRef = useRef<MapRef | null>(null);
  const [viewState, setViewState] = useState({
    latitude: 30.3753,
    longitude: 69.3451,
    zoom: 5,
  });

  // load regions via your existing action
  useEffect(() => {
    (async () => {
      try {
        const list = await get_regions();
        setRegions(list ?? []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { sites, classCounts, subregionCounts } = await getSslDashboard(
        region ?? null
      );
      setSites(sites);
      setClassCounts(classCounts);
      setSubregionCounts(subregionCounts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region]);

  const geoPoints = useMemo(
    () => sites.filter((r) => r.Latitude != null && r.Longitude != null),
    [sites]
  );

  useEffect(() => {
    if (geoPoints.length === 0) {
      setViewState({ latitude: 30.3753, longitude: 69.3451, zoom: 5 });
      return;
    }
    const lat =
      geoPoints.reduce((s, r) => s + (r.Latitude ?? 0), 0) / geoPoints.length;
    const lng =
      geoPoints.reduce((s, r) => s + (r.Longitude ?? 0), 0) / geoPoints.length;
    setViewState((vs) => ({ ...vs, latitude: lat, longitude: lng, zoom: 6 }));
  }, [geoPoints]);

  const totalSites = sites.length;

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* header + filter */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">SSL Dashboard</h1>

        <div className="flex items-center gap-2">
          <Select
            value={region ?? undefined}
            onValueChange={(v) => setRegion(v)}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="All Regions" />
            </SelectTrigger>
            <SelectContent>
              {regions.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="secondary" onClick={() => setRegion(undefined)}>
            Clear Region
          </Button>
          <Button onClick={fetchData} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </Button>
        </div>
      </div>

      {/* top cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {(["Platinum", "Gold", "Strategic", "Silver", "Bronze"] as const).map(
          (c) => {
            const val = classCounts.find((x) => x.name === c)?.value ?? 0;
            return (
              <Card key={c} className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{c}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-3xl font-semibold">
                    {val.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">sites</div>
                </CardContent>
              </Card>
            );
          }
        )}
      </div>

      {/* charts + map */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Pie: by classification */}
        <Card className="h-[380px]">
          <CardHeader>
            <CardTitle>By Site Classification</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={classCounts}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                >
                  {classCounts.map((entry) => (
                    <Cell key={entry.name} fill={CLASS_COLORS[entry.name]} />
                  ))}
                </Pie>
                <ReTooltip />
                <ReLegend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar: by subregion */}
        <Card className="h-[380px]">
          <CardHeader>
            <CardTitle>Sites per SubRegion</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={subregionCounts.map((d) => ({
                  // keep SQL clean (no coalesce); just render a label in UI for nulls
                  subregion: d.subregion ?? "(blank)",
                  value: d.value,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subregion" hide={subregionCounts.length > 12} />
                <YAxis allowDecimals={false} />
                <ReTooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Map */}
        <Card className="h-[380px]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Sites Map</CardTitle>
              <div className="text-sm text-muted-foreground">
                {totalSites.toLocaleString()} sites
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[320px]">
            <Map
              ref={mapRef}
              mapLib={maplibregl}
              mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
              style={{ width: "100%", height: "100%" }}
              {...viewState}
              onMove={(evt) => setViewState(evt.viewState)}
            >
              {geoPoints.map((p) => (
                <Marker
                  key={`${p.Name}-${p.Latitude}-${p.Longitude}`}
                  latitude={p.Latitude!}
                  longitude={p.Longitude!}
                  anchor="bottom"
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full border border-white shadow"
                    style={{
                      backgroundColor:
                        p.SiteClassification &&
                        (
                          [
                            "Platinum",
                            "Gold",
                            "Strategic",
                            "Silver",
                            "Bronze",
                          ] as const
                        ).includes(p.SiteClassification as any)
                          ? (
                              {
                                Platinum: "#60A5FA",
                                Gold: "#F59E0B",
                                Strategic: "#22C55E",
                                Silver: "#94A3B8",
                                Bronze: "#B45309",
                              } as const
                            )[p.SiteClassification as keyof typeof CLASS_COLORS]
                          : "#10B981",
                    }}
                    title={`${p.Name} • ${p.SiteClassification ?? ""} • ${
                      p.SubRegion ?? ""
                    }`}
                  />
                </Marker>
              ))}
            </Map>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
