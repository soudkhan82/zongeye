// app/gis/components/PointSizeMap.tsx
"use client";

import { useMemo, useRef, useState } from "react";
import Map, { Marker, MapRef, Popup } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

/** KPIs you want to support for sizing (typed, no `any`) */
export type KpiKey =
  | "MFULTotalRev"
  | "MFULDataRev"
  | "MFULVoiceRev"
  | "data4GTrafficGB"
  | "data3GTrafficGB"
  | "voice2GTrafficE"
  | "voice3GTrafficE"
  | "voLTEVoiceTrafficE";

/** Point shape expected by the map (typed, no `any`) */
export type MapPoint = {
  Name: string;
  SubRegion: string | null;
  District: string | null;
  Grid: string | null;
  SiteClassification: string | null;
  Longitude: number | null;
  Latitude: number | null;

  MFULTotalRev: number | string | null;
  MFULDataRev: number | string | null;
  MFULVoiceRev: number | string | null;
  data4GTrafficGB: number | string | null;
  data3GTrafficGB: number | string | null;
  voice2GTrafficE: number | string | null;
  voice3GTrafficE: number | string | null;
  voLTEVoiceTrafficE: number | string | null;

  Month: string | null;
};

type Props = {
  points: MapPoint[];
  kpiKey: KpiKey; // required, controlled by your dropdown
  initialView?: { longitude: number; latitude: number; zoom: number };
  showLegend?: boolean;
};

const DEFAULT_VIEW = { longitude: 69.3451, latitude: 30.3753, zoom: 4.8 };

function toNumber(val: number | string | null | undefined): number | null {
  if (val === null || typeof val === "undefined") return null;
  if (typeof val === "number") return Number.isFinite(val) ? val : null;
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

export default function PointSizeMap({
  points,
  kpiKey,
  initialView = DEFAULT_VIEW,
  showLegend = true,
}: Props) {
  const mapRef = useRef<MapRef | null>(null);

  // compute KPI range
  const { min, max } = useMemo(() => {
    const nums: number[] = [];
    for (const p of points) {
      const n = toNumber(p[kpiKey]);
      if (n !== null) nums.push(n);
    }
    if (!nums.length) return { min: 0, max: 1 };
    return { min: Math.min(...nums), max: Math.max(...nums) };
  }, [points, kpiKey]);

  // 8 → 34 px linear scale with guards
  const sizeFor = (val: number | string | null | undefined) => {
    const n = toNumber(val);
    if (n === null || max === min) return 8;
    const t = clamp((n - min) / (max - min), 0, 1);
    return 8 + t * (34 - 8);
  };

  const [hover, setHover] = useState<MapPoint | null>(null);

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border">
      <Map
        ref={mapRef}
        initialViewState={initialView}
        mapLib={import("maplibre-gl")}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        style={{ width: "100%", height: "100%" }}
      >
        {points.map((p) => {
          const lon = p.Longitude;
          const lat = p.Latitude;
          if (lon == null || lat == null) return null;

          const size = sizeFor(p[kpiKey]);
          return (
            <Marker
              key={`${p.Name}-${lon}-${lat}`}
              longitude={lon}
              latitude={lat}
              anchor="center"
            >
              <div
                title={`${p.Name}\n${kpiKey}: ${p[kpiKey] ?? "-"}`}
                onMouseEnter={() => setHover(p)}
                onMouseLeave={() => setHover(null)}
                className="rounded-full bg-emerald-600/70 border border-white/70 shadow"
                style={{ width: size, height: size }}
              />
            </Marker>
          );
        })}

        {hover && hover.Longitude != null && hover.Latitude != null && (
          <Popup
            longitude={hover.Longitude}
            latitude={hover.Latitude}
            closeButton={false}
            onClose={() => setHover(null)}
            anchor="top"
          >
            <div className="text-sm">
              <div className="font-semibold">{hover.Name}</div>
              <div>SubRegion: {hover.SubRegion ?? "-"}</div>
              <div>District: {hover.District ?? "-"}</div>
              <div>
                {kpiKey}: {hover[kpiKey] ?? "-"}
              </div>
              <div>Month: {hover.Month ?? "-"}</div>
            </div>
          </Popup>
        )}

        {showLegend && (
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur rounded-md px-3 py-2 text-xs shadow">
            <div className="font-medium mb-1">Point size ∝ {kpiKey}</div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span
                  className="inline-block rounded-full bg-emerald-600/70 border border-white/70"
                  style={{ width: 8, height: 8 }}
                />
                <span>Low</span>
              </div>
              <div className="flex items-center gap-1">
                <span
                  className="inline-block rounded-full bg-emerald-600/70 border border-white/70"
                  style={{ width: 34, height: 34 }}
                />
                <span>High</span>
              </div>
            </div>
            <div className="mt-1 text-[10px] text-gray-500">
              Range: {Number.isFinite(min) ? Math.round(min) : "-"} →{" "}
              {Number.isFinite(max) ? Math.round(max) : "-"}
            </div>
          </div>
        )}
      </Map>
    </div>
  );
}
