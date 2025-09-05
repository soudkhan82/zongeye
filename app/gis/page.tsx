"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  getEquipmentCounts,
  getMonsoonSitesFC,
  getSiteAvailabilityTable,
  getSubregionAvailabilityDaily_monsoon,
  getSubregionAvailabilityDaily_overall,
  type EquipCountsRow,
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
  Legend,
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

// ---------- Helpers ----------
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

function Stat({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  return (
    <div className="rounded-xl border p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-xs text-gray-500">{total} sites</div>
    </div>
  );
}

// --- Small components -------------------------------------------------
type ChartPoint = { Timeline: string; AvgAvailability: number | null };

// ✅ Two-line ChartsCard: Overall (by subregion) vs monsoon_sites_availability
function ChartsCard({
  srLoad,
  msLoad,
  subregionTrendData,
  monsoonSitesTrendData,
  subregion,
}: {
  srLoad: boolean;
  msLoad: boolean;
  subregionTrendData: ChartPoint[]; // overall series
  monsoonSitesTrendData: ChartPoint[]; // monsoon series
  subregion: string;
}) {
  type Merged = {
    Timeline: string;
    Subregion: number | null;
    MonsoonSites: number | null;
  };

  const mergedData: Merged[] = useMemo(() => {
    const byDate = new Map<string, Merged>();
    const put = (
      date: string,
      key: "Subregion" | "MonsoonSites",
      v: number | null
    ) => {
      const k = date.slice(0, 10);
      const prev = byDate.get(k) ?? {
        Timeline: k,
        Subregion: null,
        MonsoonSites: null,
      };
      prev[key] = v;
      byDate.set(k, prev);
    };
    subregionTrendData.forEach((p) =>
      put(p.Timeline, "Subregion", p.AvgAvailability)
    );
    monsoonSitesTrendData.forEach((p) =>
      put(p.Timeline, "MonsoonSites", p.AvgAvailability)
    );
    return Array.from(byDate.values()).sort((a, b) =>
      a.Timeline.localeCompare(b.Timeline)
    );
  }, [subregionTrendData, monsoonSitesTrendData]);

  const isLoading = srLoad || msLoad;
  const hasData = mergedData.length > 0;

  return (
    <div className="rounded-2xl border bg-white p-3 h-[55vh] md:h-[50vh] lg:h-[75vh] min-w-0">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">
          Availability — {subregion === "All" ? "All Subregions" : subregion} vs{" "}
          monsoon_sites_availability
        </h3>
        {!isLoading && (
          <span className="text-xs text-gray-500">
            {mergedData.length} days
          </span>
        )}
      </div>

      <div className="h-[calc(100%-1.5rem)] min-w-0">
        {isLoading || !hasData ? (
          <div className="text-xs text-gray-600 h-full flex items-center justify-center">
            {isLoading ? "Loading…" : "No data."}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              key={`combined-${subregion}-${mergedData.length}`}
              data={mergedData}
              margin={{ top: 6, right: 12, left: 8, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="Timeline"
                tick={{ fontSize: 10 }}
                minTickGap={16}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 10 }}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                formatter={(v: unknown, name: string) =>
                  v == null ? ["—", name] : [`${Number(v).toFixed(2)}%`, name]
                }
                labelFormatter={(l: string) => `Date: ${l}`}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="Subregion"
                name={subregion === "All" ? "All Subregions" : subregion}
                stroke="#ef4444"
                strokeWidth={1.8}
                dot={false}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="MonsoonSites"
                name="monsoon_sites_availability"
                stroke="#10b981"
                strokeWidth={1.8}
                dot={false}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function SiteTable({
  q,
  setQ,
  rows,
  onRowClick,
}: {
  q: string;
  setQ: (v: string) => void;
  rows: SiteAvailabilityRow[];
  onRowClick: (siteId: string) => void;
}) {
  return (
    <div className="rounded-2xl border bg-white h-[50vh] md:h-[55vh] lg:h-[65vh] flex flex-col min-w-0">
      <div className="p-3 border-b flex items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search SiteID or District…"
          className="w-full text-sm border rounded px-2 py-1"
        />
        <span className="text-xs text-gray-500 whitespace-nowrap">
          {rows.length} rows
        </span>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b sticky top-0 bg-white z-10">
              <th className="py-1 px-2">SiteID</th>
              <th className="py-1 px-2">District</th>
              <th className="py-1 px-2 text-right">Availability</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.SiteID}
                className="border-b hover:bg-indigo-50 cursor-pointer"
                onClick={() => onRowClick(r.SiteID)}
                onKeyDown={(e) => e.key === "Enter" && onRowClick(r.SiteID)}
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
            {!rows.length && (
              <tr>
                <td colSpan={3} className="py-3 px-2 text-center text-gray-500">
                  No matching rows.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------- Page ----------
export default function MonsoonSitesPage() {
  const [equipCounts, setEquipCounts] = useState<EquipCountsRow[]>([]);
  const [equipErr, setEquipErr] = useState<string | null>(null);

  // Monsoon & Overall time series (per subregion & "All")
  const [subregionDaily, setSubregionDaily] = useState<SubregionDailyRow[]>([]); // monsoon
  const [srLoad, setSrLoad] = useState<boolean>(true);
  const [srErr, setSrErr] = useState<string | null>(null);

  const [overallDaily, setOverallDaily] = useState<SubregionDailyRow[]>([]); // overall
  const [ovrLoad, setOvrLoad] = useState<boolean>(true);
  const [ovrErr, setOvrErr] = useState<string | null>(null);

  // Map + data states
  const mapRef = useRef<MapRef | null>(null);
  const [sitesFC, setSitesFC] = useState<SitesFC | null>(null);
  const [waterways, setWaterways] = useState<WaterFC | null>(null);
  const [hover, setHover] = useState<HoverInfo>(null);
  const [loading, setLoading] = useState(true); // fetching getMonsoonSitesFC (for map)
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters + table
  const [subregion, setSubregion] = useState<string>("All");
  const [q, setQ] = useState<string>("");

  // Per-site availability table (SQL)
  const [siteRows, setSiteRows] = useState<SiteAvailabilityRow[]>([]);
  const [rowsLoading, setRowsLoading] = useState<boolean>(true);
  const [rowsErr, setRowsErr] = useState<string | null>(null);

  // Counters
  useEffect(() => {
    (async () => {
      try {
        const rows = await getEquipmentCounts();
        setEquipCounts(rows ?? []);
      } catch (e: unknown) {
        setEquipErr(e instanceof Error ? e.message : String(e));
      }
    })();
  }, []);

  const equipNow = useMemo(() => {
    const wanted = subregion || "All";
    const byWanted = equipCounts.find(
      (r) => (r.SubRegion ?? "Unknown") === wanted
    );
    const byAll = equipCounts.find((r) => (r.SubRegion ?? "Unknown") === "All");
    return (
      byWanted ??
      byAll ?? { SubRegion: wanted, moved_yes: 0, packed_yes: 0, total: 0 }
    );
  }, [equipCounts, subregion]);

  // ---- Fetchers ----
  useEffect(() => {
    (async () => {
      try {
        setSrLoad(true);
        const rows = await getSubregionAvailabilityDaily_monsoon();
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
        setOvrLoad(true);
        const rows = await getSubregionAvailabilityDaily_overall();
        setOverallDaily(rows ?? []);
      } catch (e: unknown) {
        setOvrErr(e instanceof Error ? e.message : String(e));
      } finally {
        setOvrLoad(false);
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
  // Overall series (now used as the "Subregion" red line)
  const subregionTrendData = useMemo<ChartPoint[]>(() => {
    if (!overallDaily.length) return [];
    const wanted = subregion || "All";
    return overallDaily
      .filter((r) => (r.SubRegion ?? "Unknown") === wanted)
      .map((r) => ({
        Timeline: String(r.Timeline).slice(0, 10),
        AvgAvailability:
          r.AvgAvailability == null ? null : Number(r.AvgAvailability),
      }))
      .sort((a, b) => a.Timeline.localeCompare(b.Timeline));
  }, [overallDaily, subregion]);

  // Monsoon series (green, labeled monsoon_sites_availability)
  const monsoonSitesTrendData = useMemo<ChartPoint[]>(() => {
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

  // ---- Map events ----
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
      {srErr && <div className="text-sm text-red-600">Error: {srErr}</div>}
      {ovrErr && <div className="text-sm text-red-600">Error: {ovrErr}</div>}

      {/* Equipment cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-1 md:col-span-3 rounded-2xl border bg-white p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">
              Equipment Status{" "}
              {subregion === "All" ? "(All Subregions)" : `— ${subregion}`}
            </h2>
            {equipErr && (
              <span className="text-sm text-red-600">Error: {equipErr}</span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Stat
              label="Moved (Yes)"
              value={equipNow.moved_yes}
              total={equipNow.total}
            />
            <Stat
              label="Packed (Yes)"
              value={equipNow.packed_yes}
              total={equipNow.total}
            />
            <div className="rounded-xl border p-3">
              <div className="text-xs text-gray-500">Completion</div>
              <div className="text-2xl font-semibold">
                {equipNow.total
                  ? `${(
                      ((equipNow.moved_yes + equipNow.packed_yes) /
                        (2 * equipNow.total)) *
                      100
                    ).toFixed(1)}%`
                  : "—"}
              </div>
              <div className="text-xs text-gray-500">avg of both</div>
            </div>
          </div>
        </div>
      </div>

      {/* Map + right rail */}
      <div className="grid grid-cols-5 gap-2">
        {/* MAP */}
        <div className="col-span-3 h-[54vh] md:h-[56vh] lg:h-[58vh] rounded-2xl overflow-hidden border bg-white">
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

        {/* RIGHT RAIL — two-line chart + table */}
        <div className="col-span-2 flex flex-col gap-4 min-w-0 ">
          <ChartsCard
            srLoad={ovrLoad} // overall series loading
            msLoad={srLoad} // monsoon series loading
            subregionTrendData={subregionTrendData} // overall
            monsoonSitesTrendData={monsoonSitesTrendData} // monsoon
            subregion={subregion}
          />
        </div>
        <div className="col-span-2 flex flex-col gap-4 min-w-0 mt-2">
          <SiteTable
            q={q}
            setQ={setQ}
            rows={visibleRows}
            onRowClick={flyToSite}
          />
        </div>
      </div>
    </div>
  );
}
