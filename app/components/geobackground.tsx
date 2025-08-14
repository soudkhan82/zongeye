"use client";

import { useRef } from "react";
import maplibregl from "maplibre-gl";
import Map, { MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

export default function GeoBackground() {
  const mapRef = useRef<MapRef | null>(null);

  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <Map
        ref={mapRef}
        mapLib={maplibregl}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        initialViewState={{
          latitude: 30.3753, // Pakistan-ish center; tweak to taste
          longitude: 69.3451,
          zoom: 4.5,
          bearing: -10,
          pitch: 0,
        }}
        style={{ width: "100%", height: "100%" }}
        // Make it purely decorative
        dragPan={false}
        dragRotate={false}
        scrollZoom={false}
        doubleClickZoom={false}
        touchZoomRotate={false}
        keyboard={false}
      />

      {/* Soft vignette to keep the form readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/30" />

      {/* Subtle lat/long grid */}
      <div
        className="
          absolute inset-0 mix-blend-overlay opacity-30
          [background-image:
            linear-gradient(rgba(255,255,255,0.08) 1px,transparent 1px),
            linear-gradient(90deg,rgba(255,255,255,0.08) 1px,transparent 1px)
          ]
          bg-[length:40px_40px]
        "
      />

      {/* Tiny noise for texture */}
      <div
        className="
          absolute inset-0 opacity-10
          [background-image:radial-gradient(rgba(255,255,255,0.15)_1px,transparent_1px)]
          bg-[size:3px_3px]
        "
      />
    </div>
  );
}
