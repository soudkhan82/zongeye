"use client";

import {
  useRef,
  useMemo,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import MapGL, {
  Marker,
  NavigationControl,
  MapRef,
  Popup,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";
import { sslSite } from "@/interfaces";

export interface MapProps {
  points: sslSite[];
  initialView?: { latitude: number; longitude: number; zoom: number };
  /** highlight this site (by name or your own unique key) */
  selectedName?: string | null;
  /** auto fit to points on mount/changes */
  autoFit?: boolean;
}

export type MapHandle = {
  flyTo: (lon: number, lat: number, zoom?: number) => void;
  fitToPoints: (padding?: number) => void;
};

function fmt(n: number | null | undefined, opts?: Intl.NumberFormatOptions) {
  return n == null ? "—" : n.toLocaleString(undefined, opts);
}

function getMarkerColor(cls?: string | null) {
  switch ((cls ?? "").toLowerCase()) {
    case "platinum":
      return "bg-green-700";
    case "gold":
      return "bg-yellow-500";
    case "strategic":
      return "bg-blue-600";
    case "silver":
      return "bg-gray-400";
    case "bronze":
      return "bg-orange-600";
    default:
      return "bg-red-600";
  }
}

function getBoundsFromPoints(
  pts: { latitude: number; longitude: number }[]
): [[number, number], [number, number]] | null {
  let minLat = Infinity,
    minLng = Infinity,
    maxLat = -Infinity,
    maxLng = -Infinity;
  for (const p of pts) {
    if (!Number.isFinite(p.latitude) || !Number.isFinite(p.longitude)) continue;
    if (p.latitude < minLat) minLat = p.latitude;
    if (p.latitude > maxLat) maxLat = p.latitude;
    if (p.longitude < minLng) minLng = p.longitude;
    if (p.longitude > maxLng) maxLng = p.longitude;
  }
  if (
    !Number.isFinite(minLat) ||
    !Number.isFinite(minLng) ||
    !Number.isFinite(maxLat) ||
    !Number.isFinite(maxLng)
  ) {
    return null;
  }
  // Return a MUTABLE tuple (no `as const`)
  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
}

const SSlMap = forwardRef<MapHandle, MapProps>(function SSlMap(
  { points, initialView, selectedName = null, autoFit = true },
  ref
) {
  const mapRef = useRef<MapRef | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<sslSite | null>(null);

  const center = useMemo(() => {
    if (initialView) return initialView;
    // Fallback center (Pakistan approx)
    return { latitude: 30.3753, longitude: 69.3451, zoom: 4.5 };
  }, [initialView]);

  // Expose imperative API
  useImperativeHandle(
    ref,
    () => ({
      flyTo: (lon: number, lat: number, zoom = 13) => {
        const m = mapRef.current?.getMap();
        if (!m) return;
        m.flyTo({ center: [lon, lat], zoom, duration: 800, essential: true });
      },
      fitToPoints: (padding = 60) => {
        const m = mapRef.current?.getMap();
        if (!m || !points.length) return;
        const b = getBoundsFromPoints(points);
        if (!b) return;
        m.fitBounds(b, { padding, duration: 600, maxZoom: 14 });
      },
    }),
    [points]
  );

  // Auto-fit on mount/points changes
  useEffect(() => {
    if (!autoFit || !points.length) return;
    const m = mapRef.current?.getMap();
    if (!m) return;
    const b = getBoundsFromPoints(points);
    if (b) m.fitBounds(b, { padding: 60, duration: 600, maxZoom: 14 });
  }, [autoFit, points]);

  // Recenter to average if you prefer gentle re-center on points change (optional)
  // const avgCenter = useMemo(() => {
  //   if (!points.length) return null;
  //   let lat = 0, lng = 0;
  //   for (const p of points) { lat += p.latitude; lng += p.longitude; }
  //   return { latitude: lat / points.length, longitude: lng / points.length };
  // }, [points]);

  return (
    <div className="w-full h-[600px] rounded-2xl overflow-hidden border">
      <MapGL
        ref={mapRef}
        initialViewState={center}
        mapLib={maplibregl} // pass the object, not a module promise
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="top-left" />

        {points.map((p) => {
          const colorClass = getMarkerColor(p.Siteclassification);
          const isSelected = selectedName && p.name === selectedName;
          const size = isSelected ? 14 : 10;

          return (
            <Marker
              key={`${p.name}-${p.latitude}-${p.longitude}`}
              latitude={p.latitude}
              longitude={p.longitude}
              anchor="center"
            >
              <div
                className={`rounded-full ${colorClass} border border-white/80 shadow-sm cursor-pointer ${
                  isSelected ? "ring-2 ring-black/30" : ""
                }`}
                style={{ width: size, height: size }}
                onMouseEnter={() => setHoveredPoint(p)}
                onMouseLeave={() => setHoveredPoint(null)}
                onClick={() => {
                  // fly a bit closer on click
                  mapRef.current?.getMap().flyTo({
                    center: [p.longitude, p.latitude],
                    zoom: Math.max(
                      (mapRef.current?.getMap().getZoom() ?? 10) + 2,
                      12
                    ),
                    duration: 600,
                    essential: true,
                  });
                }}
                title={`${p.name}${
                  p.Siteclassification ? ` • ${p.Siteclassification}` : ""
                }`}
              />
            </Marker>
          );
        })}

        {hoveredPoint && (
          <Popup
            latitude={hoveredPoint.latitude}
            longitude={hoveredPoint.longitude}
            anchor="top"
            closeButton={false}
            closeOnClick={false}
            onClose={() => setHoveredPoint(null)}
          >
            <div className="text-sm space-y-1">
              <div className="font-medium">{hoveredPoint.name}</div>
              {hoveredPoint.subregion && (
                <div>Subregion: {hoveredPoint.subregion}</div>
              )}
              {hoveredPoint.Siteclassification && (
                <div>SiteClassification: {hoveredPoint.Siteclassification}</div>
              )}
              {hoveredPoint.grid && <div>Grid: {hoveredPoint.grid}</div>}
              {hoveredPoint.address && (
                <div>Address: {hoveredPoint.address}</div>
              )}
            </div>
          </Popup>
        )}
      </MapGL>
    </div>
  );
});

export default SSlMap;
