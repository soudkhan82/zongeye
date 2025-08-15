"use client";

import * as React from "react";
import Map, { Layer, Source, MapRef, Popup, type MapLib } from "react-map-gl";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Feature, FeatureCollection, Point } from "geojson";
import type { Map as MapboxMap } from "mapbox-gl"; // TS expects Mapbox types
import { DataTraffic } from "@/interfaces";

export interface VoiceHeatPoint {
  name: string;
  latitude: number;
  longitude: number;
  data3gtraffic: number;
  data4gtraffic: number;
  district?: string;
  subregion?: string;
  siteclassification?: string;
  address?: string;
}

type DataProps = {
  name: string;
  weight: number;
  district?: string;
  subregion?: string;
  siteclassification?: string;
  address?: string;
};

type DataFeature = Feature<Point, DataProps>;

interface Props {
  points: DataTraffic[];
  initialView?: { longitude: number; latitude: number; zoom: number };
}

export default function DataHeatmap({ points, initialView }: Props) {
  const mapRef = React.useRef<MapRef | null>(null);

  // Build GeoJSON (weight = 2G + 3G + VoLTE)
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
          geometry: {
            type: "Point",
            coordinates: [p.longitude, p.latitude],
          },
        };
      });

    return { type: "FeatureCollection", features };
  }, [points]);

  // Fit bounds (array form; no MapLibre classes)
  React.useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || geojson.features.length === 0) return;

    const coords = geojson.features
      .map((f) => f.geometry)
      .filter((g): g is Point => g.type === "Point")
      .map((g) => g.coordinates as [number, number]);

    let minLng = Infinity,
      minLat = Infinity,
      maxLng = -Infinity,
      maxLat = -Infinity;

    for (const [lng, lat] of coords) {
      if (lng < minLng) minLng = lng;
      if (lat < minLat) minLat = lat;
      if (lng > maxLng) maxLng = lng;
      if (lat > maxLat) maxLat = lat;
    }

    if (coords.length === 1) {
      const pad = 0.01;
      minLng -= pad;
      minLat -= pad;
      maxLng += pad;
      maxLat += pad;
    }

    const bounds: [[number, number], [number, number]] = [
      [minLng, minLat],
      [maxLng, maxLat],
    ];
    map.fitBounds(bounds, { padding: 40, duration: 500 });
  }, [geojson]);

  // Hover + Click popup state (typed)
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
        // MapLibre at runtime, cast to the Mapbox interface expected by react-map-gl
        mapLib={maplibregl as unknown as MapLib<MapboxMap>}
        style={{ width: "100%", height: "100%" }}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        interactiveLayerIds={["voice-circles"]} // interactions on circle layer only
        onClick={(e) => {
          const f = e.features?.[0];
          if (!f) return;
          const geom = f.geometry;
          if (geom && geom.type === "Point") {
            const coords = (geom as Point).coordinates as [number, number];
            const props = f.properties as unknown as DataProps;
            setSelected({
              lng: e.lngLat.lng ?? coords[0],
              lat: e.lngLat.lat ?? coords[1],
              props,
            });
          }
        }}
        onMouseMove={(e) => {
          const f = e.features?.[0];
          if (!f) {
            setHoverInfo(null);
            return;
          }
          const geom = f.geometry;
          if (geom && geom.type === "Point") {
            const coords = (geom as Point).coordinates as [number, number];
            const props = f.properties as unknown as DataProps;
            setHoverInfo({
              lng: e.lngLat.lng ?? coords[0],
              lat: e.lngLat.lat ?? coords[1],
              props,
            });
          }
        }}
        onMouseLeave={() => setHoverInfo(null)}
      >
        <Source id="voice-points" type="geojson" data={geojson}>
          {/* Heatmap */}
          <Layer
            id="voice-heatmap"
            type="heatmap"
            source="voice-points"
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

          {/* Circles at high zoom for precise interaction */}
          <Layer
            id="voice-circles"
            type="circle"
            source="voice-points"
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

        {/* Hover tooltip (hidden if a selection is open) */}
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
              <div>Total Voice (Erl): {hoverInfo.props.weight}</div>
              {hoverInfo.props.district && (
                <div>District: {hoverInfo.props.district}</div>
              )}
              {hoverInfo.props.subregion && (
                <div>Subregion: {hoverInfo.props.subregion}</div>
              )}
            </div>
          </Popup>
        )}

        {/* Click popup */}
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
              <div>Total Voice (Erl): {selected.props.weight}</div>
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
}
