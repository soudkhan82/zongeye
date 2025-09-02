"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  getMonsoonSitesFC,
  getSiteAvailabilityTable,
  getSubregionAvailabilityDaily,
  type SubregionDailyRow,
  type FeatureCollection as SitesFC,
  type SiteAvailabilityRow,
} from "@/app/actions/gis";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import ReactMap, {
  Source,
  Layer,
  NavigationControl,
  MapRef,
  Popup,
  MapLayerMouseEvent,
} from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// ---------- Helpers (strict typing) ----------
type PropsRec = Record<string, unknown>;

const readString = (obj: PropsRec | undefined, key: string): string | null => {
  const v = obj?.[key];
  return typeof v === "string" ? v : v == null ? null : String(v);
};

const getSubregion = (p?: PropsRec): string => {
  return (
    readString(p, "SubRegion") ??
    readString(p, "Subregion") ??
    readString(p, "subregion") ??
    readString(p, "Region") ??
    "Unknown"
  );
};

type HoverInfo = {
  lng: number;
  lat: number;
  siteId?: string | null;
  subregion?: string | null;
  waterName?: string;
  waterway?: string;
} | null;

// Rivers typing
type WaterProps = {
  name?: string;
  "name:en"?: string;
  "name:ur"?: string;
  waterway?: string;
};
type WaterFC = GeoJSON.FeatureCollection<
  GeoJSON.LineString | GeoJSON.MultiLineString,
  WaterProps
>;

// ---------- Component ----------
export default function MonsoonSitesPage() {
  // Subregion daily trend (SQL)
  const [subregionDaily, setSubregionDaily] = useState<SubregionDailyRow[]>([]);
  const [srLoad, setSrLoad] = useState<boolean>(true);
  const [srErr, setSrErr] = useState<string | null>(null);

  // Map + data states
  const mapRef = useRef<MapRef | null>(null);
  const [sitesFC, setSitesFC] = useState<SitesFC | null>(null);
  const [waterways, setWaterways] = useState<WaterFC | null>(null);
  const [hover, setHover] = useState<HoverInfo>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters + table
  const [subregion, setSubregion] = useState<string>("All");
  const [q, setQ] = useState<string>("");

  // Per-site availability table (SQL)
  const [siteRows, setSiteRows] = useState<SiteAvailabilityRow[]>([]);
  const [rowsLoading, setRowsLoading] = useState<boolean>(true);
  const [rowsErr, setRowsErr] = useState<string | null>(null);

  // ---- Fetchers ----
  useEffect(() => {
    (async () => {
      try {
        setSrLoad(true);
        const rows = await getSubregionAvailabilityDaily();
        setSubregionDaily(rows ?? []);
      } catch (e: unknown) {
        setSrErr(e instanceof Error ? e.message : String(e));
      } finally {
        setSrLoad(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const fc = await getMonsoonSitesFC();
        setSitesFC(fc);
      } catch (e: unknown) {
        setErrorMsg(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setRowsLoading(true);
        const rows = await getSiteAvailabilityTable();
        setSiteRows(rows ?? []);
      } catch (e: unknown) {
        setRowsErr(e instanceof Error ? e.message : String(e));
      } finally {
        setRowsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/rivers_pak.geojson", { cache: "no-store" });
        if (!res.ok) throw new Error(`Waterways HTTP ${res.status}`);
        const raw = (await res.json()) as GeoJSON.FeatureCollection;

        // Narrow to WaterFC and filter
        const feats = raw.features.filter(
          (f): f is WaterFC["features"][number] => {
            const props = (f.properties ?? {}) as PropsRec;
            const nm = readString(props, "name");
            const w = readString(props, "waterway");
            return !!nm && w !== "canal";
          }
        );

        const fc: WaterFC = { type: "FeatureCollection", features: feats };
        setWaterways(fc);
      } catch (e: unknown) {
        setErrorMsg(e instanceof Error ? e.message : String(e));
      }
    })();
  }, []);

  // ---- Derived data ----
  const subregionTrendData = useMemo<
    { Timeline: string; AvgAvailability: number | null }[]
  >(() => {
    if (!subregionDaily.length) return [];
    const wanted = subregion || "All";
    return subregionDaily
      .filter((r) => (r.SubRegion ?? "Unknown") === wanted)
      .map((r) => ({
        Timeline: String(r.Timeline).slice(0, 10),
        AvgAvailability:
          r.AvgAvailability == null ? null : Number(r.AvgAvailability),
      }))
      .sort((a, b) => a.Timeline.localeCompare(b.Timeline));
  }, [subregionDaily, subregion]);

  const subregionOptions = useMemo<string[]>(() => {
    const s = new Set<string>();
    sitesFC?.features.forEach((f) => {
      const props = (f.properties ?? {}) as PropsRec;
      s.add(getSubregion(props));
    });
    const arr = Array.from(s).filter(Boolean).sort();
    return arr.includes("All")
      ? ["All", ...arr.filter((x) => x !== "All")]
      : ["All", ...arr];
  }, [sitesFC]);

  const filteredSitesFC = useMemo<SitesFC | null>(() => {
    if (!sitesFC) return null;
    if (subregion === "All") return sitesFC;
    return {
      ...sitesFC,
      features: sitesFC.features.filter((f) => {
        const props = (f.properties ?? {}) as PropsRec;
        return getSubregion(props) === subregion;
      }),
    };
  }, [sitesFC, subregion]);

  // SiteID -> feature
  const siteIndex = useMemo(() => {
    const map = new Map<string, SitesFC["features"][number]>();
    sitesFC?.features.forEach((f) => {
      const props = (f.properties ?? {}) as PropsRec;
      const sid = readString(props, "SiteID");
      if (sid) map.set(sid, f);
    });
    return map;
  }, [sitesFC]);

  const visibleRows = useMemo<SiteAvailabilityRow[]>(() => {
    const qnorm = q.trim().toLowerCase();
    return siteRows.filter((r) => {
      if (subregion !== "All") {
        const f = siteIndex.get(r.SiteID);
        const sr = f
          ? getSubregion((f.properties ?? {}) as PropsRec)
          : "Unknown";
        if (sr !== subregion) return false;
      }
      if (!qnorm) return true;
      const inSite = r.SiteID.toLowerCase().includes(qnorm);
      const inDist = (r.District ?? "").toLowerCase().includes(qnorm);
      return inSite || inDist;
    });
  }, [siteRows, q, subregion, siteIndex]);

  // ---- Map events (strict) ----

  //helper
  type MLFeature = GeoJSON.Feature<
    GeoJSON.Geometry,
    Record<string, unknown>
  > & {
    layer?: { id?: string };
  };
  const handleMouseMove = (e: MapLayerMouseEvent) => {
    const feat = (e.features && e.features[0]) as MLFeature | undefined;
    const canvas = mapRef.current?.getCanvas?.();

    if (!feat) {
      setHover(null);
      if (canvas) canvas.style.cursor = "";
      return;
    }

    const layerId = feat.layer?.id ?? "";
    const props = (feat.properties ?? {}) as PropsRec;

    if (layerId === "sites-circle") {
      setHover({
        lng: e.lngLat.lng,
        lat: e.lngLat.lat,
        siteId: readString(props, "SiteID"),
        subregion: getSubregion(props),
      });
      if (canvas) canvas.style.cursor = "pointer";
      return;
    }

    if (layerId === "rivers-line" || layerId === "others-line") {
      setHover({
        lng: e.lngLat.lng,
        lat: e.lngLat.lat,
        waterName:
          readString(props, "name") ??
          readString(props, "name:en") ??
          readString(props, "name:ur") ??
          undefined,
        waterway: readString(props, "waterway") ?? undefined,
      });
      if (canvas) canvas.style.cursor = "pointer";
      return;
    }

    setHover(null);
    if (canvas) canvas.style.cursor = "";
  };

  const handleMouseLeave = () => {
    const canvas = mapRef.current?.getCanvas?.();
    if (canvas) canvas.style.cursor = "";
    setHover(null);
  };

  const flyToSite = (siteId: string) => {
    const f = siteIndex.get(siteId);
    if (!f || !mapRef.current) return;
    const geom = f.geometry as GeoJSON.Point;
    const coords = geom.coordinates as [number, number];
    mapRef.current.flyTo({
      center: coords,
      zoom: 10.5,
      speed: 1.2,
      essential: true,
    });
    const props = (f.properties ?? {}) as PropsRec;
    setHover({
      lng: coords[0],
      lat: coords[1],
      siteId,
      subregion: getSubregion(props),
    });
  };

  // Map filters
  const riversFilter: maplibregl.FilterSpecification = [
    "all",
    ["==", ["get", "waterway"], "river"],
    ["has", "name"],
  ];
  const othersFilter: maplibregl.FilterSpecification = [
    "all",
    ["!=", ["get", "waterway"], "river"],
    ["has", "name"],
  ];

  return (
    <div className="w-full p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-indigo-700">
          Monsoon Sites + Rivers
        </h1>

        <div className="flex items-center gap-2">
          <label htmlFor="subregion" className="text-sm text-gray-700">
            Subregion:
          </label>
          <select
            id="subregion"
            value={subregion}
            onChange={(e) => setSubregion(e.target.value)}
            className="text-sm border rounded px-2 py-1 bg-white"
          >
            {subregionOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {(loading || rowsLoading) && (
        <div className="text-sm text-gray-600">Loading…</div>
      )}
      {errorMsg && (
        <div className="text-sm text-red-600">Error: {errorMsg}</div>
      )}
      {rowsErr && <div className="text-sm text-red-600">Error: {rowsErr}</div>}

      <div className="grid grid-cols-3 gap-4">
        {/* Map (2/3) */}
        <div className="col-span-2 h-[72vh] rounded-2xl overflow-hidden border bg-white">
          <ReactMap
            ref={mapRef}
            mapLib={maplibregl}
            initialViewState={{
              longitude: 69.3451,
              latitude: 30.3753,
              zoom: 4.5,
            }}
            mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
            style={{ width: "100%", height: "100%" }}
            interactiveLayerIds={["rivers-line", "others-line", "sites-circle"]}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <NavigationControl position="top-left" />

            {waterways && (
              <Source id="pak-rivers" type="geojson" data={waterways}>
                <Layer
                  id="rivers-line"
                  type="line"
                  filter={riversFilter}
                  paint={{
                    "line-color": "#0050ff",
                    "line-width": [
                      "interpolate",
                      ["linear"],
                      ["zoom"],
                      4,
                      1.6,
                      12,
                      4.2,
                    ],
                    "line-opacity": 0.95,
                  }}
                />
                <Layer
                  id="others-line"
                  type="line"
                  filter={othersFilter}
                  paint={{
                    "line-color": "#888888",
                    "line-width": [
                      "interpolate",
                      ["linear"],
                      ["zoom"],
                      4,
                      0.5,
                      12,
                      1.6,
                    ],
                    "line-opacity": 0.6,
                  }}
                />
              </Source>
            )}

            {filteredSitesFC && (
              <Source id="monsoon-sites" type="geojson" data={filteredSitesFC}>
                <Layer
                  id="sites-circle"
                  type="circle"
                  paint={{
                    "circle-radius": [
                      "interpolate",
                      ["linear"],
                      ["zoom"],
                      4,
                      3,
                      12,
                      7,
                    ],
                    "circle-color": "#ef4444",
                    "circle-stroke-color": "#ffffff",
                    "circle-stroke-width": 1,
                    "circle-opacity": 0.9,
                  }}
                />
              </Source>
            )}

            {/* Popups */}
            {hover?.siteId !== undefined && (
              <Popup
                longitude={hover.lng}
                latitude={hover.lat}
                closeButton={false}
                closeOnClick={false}
                anchor="top"
              >
                <div className="text-sm">
                  <div>
                    <span className="font-medium">SiteID:</span>{" "}
                    {hover.siteId ?? "—"}
                  </div>
                  <div>
                    <span className="font-medium">Subregion:</span>{" "}
                    {hover.subregion ?? "—"}
                  </div>
                </div>
              </Popup>
            )}
            {hover?.siteId === undefined &&
              (hover?.waterway || hover?.waterName) && (
                <Popup
                  longitude={hover.lng}
                  latitude={hover.lat}
                  closeButton={false}
                  closeOnClick={false}
                  anchor="top"
                >
                  <div className="text-sm">
                    <div>
                      <span className="font-medium">Name:</span>{" "}
                      {hover?.waterName ?? "—"}
                    </div>
                    <div>
                      <span className="font-medium">Type:</span>{" "}
                      {hover?.waterway ?? "—"}
                    </div>
                  </div>
                </Popup>
              )}
          </ReactMap>
        </div>

        {/* Right column: Subregion trend + searchable table */}
        <div className="h-[72vh] overflow-hidden border rounded-2xl bg-white flex flex-col">
          {/* Subregion availability trend */}
          <div className="p-3 border-b">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">
                Subregion Availability Trend{" "}
                {subregion === "All" ? "(All Subregions)" : `— ${subregion}`}
              </h2>
              {!srLoad && (
                <span className="text-xs text-gray-500">
                  {subregionTrendData.length} days
                </span>
              )}
            </div>
            {srErr && (
              <div className="text-sm text-red-600">Error: {srErr}</div>
            )}
            <div className="h-48">
              {srLoad || subregionTrendData.length === 0 ? (
                <div className="text-sm text-gray-600 h-full flex items-center justify-center">
                  {srLoad ? "Loading trend…" : "No trend data."}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={subregionTrendData}
                    margin={{ top: 6, right: 12, left: 8, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="Timeline"
                      tick={{ fontSize: 11 }}
                      minTickGap={16}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      formatter={(v: unknown) =>
                        v == null
                          ? ["—", "Avg Availability"]
                          : [`${Number(v).toFixed(2)}%`, "Avg Availability"]
                      }
                      labelFormatter={(l: string) => `Date: ${l}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="AvgAvailability"
                      name="Avg Availability"
                      strokeWidth={1.8}
                      dot={false}
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Search header + table */}
          <div className="p-3 border-b flex items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search SiteID or District…"
              className="w-full text-sm border rounded px-2 py-1"
            />
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {visibleRows.length} rows
            </span>
          </div>

          <div className="overflow-auto flex-1">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left border-b sticky top-0 bg-white">
                  <th className="py-1 px-2">SiteID</th>
                  <th className="py-1 px-2">District</th>
                  <th className="py-1 px-2 text-right">Availability</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((r) => (
                  <tr
                    key={r.SiteID}
                    className="border-b hover:bg-indigo-50 cursor-pointer"
                    onClick={() => flyToSite(r.SiteID)}
                    onKeyDown={(e) => e.key === "Enter" && flyToSite(r.SiteID)}
                    tabIndex={0}
                  >
                    <td className="py-1 px-2 font-medium">{r.SiteID}</td>
                    <td className="py-1 px-2">{r.District ?? "—"}</td>
                    <td className="py-1 px-2 text-right">
                      {r.Availability == null
                        ? "—"
                        : `${Number(r.Availability).toFixed(2)}%`}
                    </td>
                  </tr>
                ))}
                {!visibleRows.length && (
                  <tr>
                    <td
                      colSpan={3}
                      className="py-3 px-2 text-center text-gray-500"
                    >
                      No matching rows.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
