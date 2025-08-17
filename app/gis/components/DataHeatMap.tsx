// DataHeatMap.tsx
"use client";

import * as React from "react";
import Map, { Layer, Source, MapRef, Popup, type MapLib } from "react-map-gl";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Feature, FeatureCollection, Point } from "geojson";
import type { Map as MapboxMap } from "mapbox-gl";
import { DataTraffic } from "@/interfaces";

// ---------- types ----------
type DataProps = {
  name: string;
  weight: number;
  district?: string;
  subregion?: string;
  siteclassification?: string;
  address?: string;
};
type DataFeature = Feature<Point, DataProps>;

export type DataMapHandle = {
  flyTo: (lng: number, lat: number, zoom?: number) => void;
  fitToPoints: (padding?: number) => void;
};

interface Props {
  points: DataTraffic[];
  initialView?: { longitude: number; latitude: number; zoom: number };
  focusZoom?: number; // default 15.5
}

// ---------- helpers ----------
function boundsFromCoords(coords: [number, number][]) {
  let minLng = Infinity,
    minLat = Infinity,
    maxLng = -Infinity,
    maxLat = -Infinity;
  for (const [lng, lat] of coords) {
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue;
    if (lng < minLng) minLng = lng;
    if (lat < minLat) minLat = lat;
    if (lng > maxLng) maxLng = lng;
    if (lat > maxLat) maxLat = lat;
  }
  if (![minLng, minLat, maxLng, maxLat].every(Number.isFinite)) return null;
  if (minLng === maxLng && minLat === maxLat) {
    const pad = 0.01;
    return [
      [minLng - pad, minLat - pad],
      [maxLng + pad, maxLat + pad],
    ] as [[number, number], [number, number]];
  }
  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ] as [[number, number], [number, number]];
}

// ---------- component ----------
const DataHeatmap = React.forwardRef<DataMapHandle, Props>(function DataHeatmap(
  { points, initialView, focusZoom = 15.5 },
  ref
) {
  const mapRef = React.useRef<MapRef | null>(null);

  // imperative API
  React.useImperativeHandle(
    ref,
    () => ({
      flyTo: (lng: number, lat: number, zoom = focusZoom) => {
        const m = mapRef.current?.getMap();
        if (!m) return;
        m.flyTo({ center: [lng, lat], zoom, duration: 600, essential: true });
      },
      fitToPoints: (padding = 60) => {
        const m = mapRef.current?.getMap();
        if (!m) return;
        const coords = geoCoords.current;
        if (!coords.length) return;
        const b = boundsFromCoords(coords);
        if (!b) return;
        m.fitBounds(b, { padding, duration: 600, maxZoom: 14 });
      },
    }),
    [focusZoom]
  );

  // build geojson
  const geojson: FeatureCollection<Point, DataProps> = React.useMemo(() => {
    const features: DataFeature[] = (points ?? [])
      .filter(
        (p) =>
          Number.isFinite(p.latitude) &&
          Number.isFinite(p.longitude) &&
          Math.abs(p.latitude) <= 90 &&
          Math.abs(p.longitude) <= 180
      )
      .map((p) => {
        const weight = (p.data3gtraffic ?? 0) + (p.data4gtraffic ?? 0);
        return {
          type: "Feature",
          properties: {
            name: p.name,
            weight,
            district: p.district,
            subregion: p.subregion,
            siteclassification: p.siteclassification,
            address: p.address,
          },
          geometry: { type: "Point", coordinates: [p.longitude, p.latitude] },
        };
      });
    return { type: "FeatureCollection", features };
  }, [points]);

  // cache coords for fitToPoints
  const geoCoords = React.useRef<[number, number][]>([]);
  geoCoords.current = geojson.features
    .filter((f) => f.geometry.type === "Point")
    .map((f) => (f.geometry as Point).coordinates as [number, number]);

  // auto-fit on data change
  React.useEffect(() => {
    const m = mapRef.current?.getMap();
    if (!m || geoCoords.current.length === 0) return;
    const b = boundsFromCoords(geoCoords.current);
    if (!b) return;
    m.fitBounds(b, { padding: 40, duration: 500, maxZoom: 14 });
  }, [geojson]);

  // hover / selection
  const [hoverInfo, setHoverInfo] = React.useState<{
    lng: number;
    lat: number;
    props: DataProps;
  } | null>(null);
  const [selected, setSelected] = React.useState<{
    lng: number;
    lat: number;
    props: DataProps;
  } | null>(null);

  const defaultView = initialView ?? {
    longitude: 73.0479,
    latitude: 33.6844,
    zoom: 5,
  };

  return (
    <div className="w-full h-full">
      <Map
        ref={mapRef}
        initialViewState={defaultView}
        mapLib={maplibregl as unknown as MapLib<MapboxMap>}
        style={{ width: "100%", height: "100%" }}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        interactiveLayerIds={["data-circles"]}
        onClick={(e) => {
          const f = e.features?.[0];
          if (!f || f.geometry.type !== "Point") return;
          const coords = (f.geometry as Point).coordinates as [number, number];
          const props = f.properties as unknown as DataProps;

          const lng = e.lngLat.lng ?? coords[0];
          const lat = e.lngLat.lat ?? coords[1];
          setSelected({ lng, lat, props });

          const m = mapRef.current?.getMap();
          const currentZoom = m?.getZoom?.() ?? 10;
          m?.flyTo({
            center: [coords[0], coords[1]],
            zoom: Math.max(currentZoom + 2, focusZoom),
            duration: 600,
            essential: true,
          });
        }}
        onMouseMove={(e) => {
          const f = e.features?.[0];
          if (!f || f.geometry.type !== "Point") return setHoverInfo(null);
          const coords = (f.geometry as Point).coordinates as [number, number];
          const props = f.properties as unknown as DataProps;
          setHoverInfo({
            lng: e.lngLat.lng ?? coords[0],
            lat: e.lngLat.lat ?? coords[1],
            props,
          });
        }}
        onMouseLeave={() => setHoverInfo(null)}
      >
        <Source id="data-points" type="geojson" data={geojson}>
          <Layer
            id="data-heatmap"
            type="heatmap"
            source="data-points"
            maxzoom={15}
            paint={{
              "heatmap-weight": [
                "interpolate",
                ["linear"],
                ["get", "weight"],
                0,
                0,
                50,
                0.25,
                150,
                0.6,
                400,
                1,
              ],
              "heatmap-intensity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                0,
                0.7,
                15,
                2,
              ],
              "heatmap-color": [
                "interpolate",
                ["linear"],
                ["heatmap-density"],
                0.0,
                "rgba(33,102,172,0)",
                0.2,
                "rgb(103,169,207)",
                0.4,
                "rgb(209,229,240)",
                0.6,
                "rgb(253,219,199)",
                0.8,
                "rgb(239,138,98)",
                1.0,
                "rgb(178,24,43)",
              ],
              "heatmap-radius": [
                "interpolate",
                ["linear"],
                ["zoom"],
                5,
                12,
                12,
                40,
              ],
              "heatmap-opacity": 0.9,
            }}
          />
          <Layer
            id="data-circles"
            type="circle"
            source="data-points"
            minzoom={12}
            paint={{
              "circle-radius": [
                "interpolate",
                ["linear"],
                ["zoom"],
                12,
                ["interpolate", ["linear"], ["get", "weight"], 0, 2, 400, 8],
                16,
                ["interpolate", ["linear"], ["get", "weight"], 0, 4, 400, 14],
              ],
              "circle-color": [
                "interpolate",
                ["linear"],
                ["get", "weight"],
                0,
                "#2b83ba",
                50,
                "#abdda4",
                150,
                "#ffffbf",
                300,
                "#fdae61",
                500,
                "#d7191c",
              ],
              "circle-stroke-color": "#ffffff",
              "circle-stroke-width": 0.5,
              "circle-opacity": 0.85,
            }}
          />
        </Source>

        {hoverInfo && !selected && (
          <Popup
            longitude={hoverInfo.lng}
            latitude={hoverInfo.lat}
            closeButton={false}
            closeOnClick={false}
            anchor="top"
            offset={8}
          >
            <div className="text-xs">
              <div className="font-semibold">{hoverInfo.props.name}</div>
              <div>Total Data (GB): {hoverInfo.props.weight}</div>
              {hoverInfo.props.district && (
                <div>District: {hoverInfo.props.district}</div>
              )}
              {hoverInfo.props.subregion && (
                <div>Subregion: {hoverInfo.props.subregion}</div>
              )}
            </div>
          </Popup>
        )}

        {selected && (
          <Popup
            longitude={selected.lng}
            latitude={selected.lat}
            anchor="top"
            onClose={() => setSelected(null)}
            offset={8}
          >
            <div className="text-sm space-y-1">
              <div className="font-semibold">{selected.props.name}</div>
              <div>Total Data (GB): {Math.ceil(selected.props.weight)}</div>
              {selected.props.siteclassification && (
                <div>Class: {selected.props.siteclassification}</div>
              )}
              {selected.props.district && (
                <div>District: {selected.props.district}</div>
              )}
              {selected.props.subregion && (
                <div>Subregion: {selected.props.subregion}</div>
              )}
              {selected.props.address && (
                <div className="max-w-[220px]">📍 {selected.props.address}</div>
              )}
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
});

export default DataHeatmap;
