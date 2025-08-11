import Map, {
  Marker,
  NavigationControl,
  MapRef,
  Popup,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useRef, useMemo, useState } from "react";
import maplibregl from "maplibre-gl";
import { VoiceTraffic } from "@/interfaces";
export interface MapProps {
  points: VoiceTraffic[];
  initialView?: {
    latitude: number;
    longitude: number;
    zoom: number;
  };
}

function fmt(n: number | null | undefined, opts?: Intl.NumberFormatOptions) {
  return n === null || typeof n === "undefined"
    ? "—"
    : n.toLocaleString(undefined, opts);
}
import { useEffect } from "react";
export default function VoiceMap({ points, initialView }: MapProps) {
  const mapRef = useRef<MapRef | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<VoiceTraffic | null>(null);
  const center = useMemo(() => {
    if (initialView) return initialView;
    // Fallback center (Pakistan approx)
    return { latitude: 30.3753, longitude: 69.3451, zoom: 4.5 };
  }, [initialView]);

  const avgCenter = useMemo(() => {
    if (!points || points.length === 0) return null;
    let latSum = 0;
    let lngSum = 0;
    let n = 0;
    for (const p of points) {
      if (Number.isFinite(p.latitude) && Number.isFinite(p.longitude)) {
        latSum += p.latitude;
        lngSum += p.longitude;
        n += 1;
      }
    }
    if (n === 0) return null;
    return { latitude: latSum / n, longitude: lngSum / n };
  }, [points]);

  useEffect(() => {
    if (!mapRef.current || !avgCenter) return;
    const map = mapRef.current.getMap();
    const currentZoom = map.getZoom();
    map.flyTo({
      center: [avgCenter.longitude, avgCenter.latitude],
      zoom: currentZoom,
      duration: 600,
      essential: true,
    });
  }, [avgCenter?.latitude, avgCenter?.longitude]);

  const getMarkerColor = (revenue: number) => {
    if (revenue === null) return "bg-gray-500";
    if (revenue <= 200000) return "bg-red-700";
    if (revenue <= 500000 && revenue > 200000) return "bg-orange-500";
    if (revenue >= 500000 && revenue <= 80000) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="w-full h-[600px] rounded-2xl overflow-hidden border">
      <Map
        ref={mapRef}
        initialViewState={center}
        mapLib={maplibregl} // <-- pass the object, not a module promise
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="top-left" />

        {points.map((p) => {
          const colorClass = getMarkerColor(p.voicerevenue);
          return (
            <Marker
              key={p.name}
              latitude={p.latitude}
              longitude={p.longitude}
              anchor="center"
            >
              <div
                className={`rounded-full ${colorClass} border border-white cursor-pointer`}
                style={{ width: 10, height: 10 }}
                onMouseEnter={() => setHoveredPoint(p)}
                onMouseLeave={() => setHoveredPoint(null)}
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
          >
            <div className="text-sm space-y-1">
              <div>
                <strong>{hoveredPoint.name}</strong>
              </div>
              {hoveredPoint.subregion && (
                <div>Subregion: {hoveredPoint.subregion}</div>
              )}
              {hoveredPoint.voice2gtraffic !== null && (
                <div>Voice 2G Traffic: {hoveredPoint.voice2gtraffic}</div>
              )}
              {hoveredPoint.voice3gtraffic !== null && (
                <div>Voice 3G Traffic: {hoveredPoint.voice3gtraffic}</div>
              )}
              {hoveredPoint.voltetraffic !== null && (
                <div>Voice LTE Traffic: {hoveredPoint.voltetraffic}</div>
              )}
              {hoveredPoint.voicerevenue !== null && (
                <div>Voice Revenue: {fmt(hoveredPoint.voicerevenue)}</div>
              )}
              {hoveredPoint.address !== null && (
                <div>Address: {hoveredPoint.address}</div>
              )}
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
