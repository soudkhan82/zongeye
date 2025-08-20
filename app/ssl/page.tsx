"use client";

import { useEffect, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { sslSite } from "@/interfaces";

import { fetchSslSites, getGrids, getDistricts } from "@/app/actions/ssl";
import SSlMap, { MapHandle } from "../gis/components/sslMap";
import { getSubregions } from "../actions/filters";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SslPage() {
  const [subregion, setSubregion] = useState<string>("North-1");
  const [grid, setGrid] = useState<string | null>(null);
  const [district, setDistrict] = useState<string | null>(null);
  const mapRef = useRef<MapHandle>(null);
  const [subregions, setSubregions] = useState<string[]>([]);
  const [grids, setGrids] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [selected, setSelected] = useState<sslSite | null>(null);

  const [rows, setRows] = useState<sslSite[]>([]);
  const [loading, setLoading] = useState(false);
  const onRowClick = (p: sslSite) => {
    setSelected(p);
    mapRef.current?.flyTo(p.longitude, p.latitude, 14);
  };

  function clearFilters() {
    setSubregion("");
    setGrid(null);
    setDistrict(null);
    setGrids([]);
    setDistricts([]);
    setRows([]); // clear results & markers
    setSelected(null);
  }

  // load subregions once
  useEffect(() => {
    (async () => {
      const list = await getSubregions(); // string[]
      setSubregions(list);
      if (!list.includes("North-1") && list.length > 0) {
        setSubregion(list[0]);
      }
    })();
  }, []);

  // when subregion changes, clear optional filters and reload their options
  useEffect(() => {
    setGrid(null);
    setDistrict(null);
    setSelected(null);
    if (!subregion) {
      setGrids([]);
      setDistricts([]);
      setRows([]);
      return;
    }
    (async () => {
      try {
        const [g, d] = await Promise.all([
          getGrids(subregion),
          getDistricts(subregion),
        ]);
        setGrids(g);
        setDistricts(d);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [subregion]);

  // fetch rows whenever filters change
  useEffect(() => {
    (async () => {
      if (!subregion) {
        setRows([]);
        return;
      }
      setLoading(true);
      try {
        const data = await fetchSslSites(subregion, grid, district);
        setRows(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [subregion, grid, district]);

  return (
    <div className="w-full p-4 space-y-4">
      <h1 className="text-2xl font-bold text-center my-6 text-indigo-700">
        Geo-Analytics: SSL Sites
      </h1>

      {/* Link to Trends (only when a row is selected) */}
      {selected && (
        <div className="text-center">
          <Link
            href={`/ssl/vitals/${encodeURIComponent(selected.name)}`}
            className="inline-block px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            View Trends for {selected.name}
          </Link>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={subregion ?? ""}
          onValueChange={(v) => {
            setSubregion(v);
            setGrid(null);
            setDistrict(null);
          }}
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select subregion" />
          </SelectTrigger>
          <SelectContent>
            {subregions.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={grid ?? ""}
          onValueChange={(v) => setGrid(v)}
          disabled={!subregion || grids.length === 0}
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Grid (optional)" />
          </SelectTrigger>
          <SelectContent>
            {grids.map((g) => (
              <SelectItem key={g} value={g}>
                {g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={district ?? ""}
          onValueChange={(v) => setDistrict(v)}
          disabled={!subregion || districts.length === 0}
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder="District (optional)" />
          </SelectTrigger>
          <SelectContent>
            {districts.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={clearFilters}>
          Clear filters
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Table */}
        <Card className="w-full h-fit">
          <CardContent className="overflow-auto max-h-[420px]">
            {loading && (
              <div className="text-center text-gray-500">Loading…</div>
            )}
            <Table className="mt-4 bg-green-100 rounded-lg overflow-hidden">
              <TableHeader className="bg-gray-200">
                <TableRow>
                  <TableHead className="font-bold">Name</TableHead>
                  <TableHead className="font-bold">District</TableHead>
                  <TableHead className="font-bold">Grid</TableHead>
                  <TableHead className="font-bold">Classification</TableHead>
                  <TableHead className="font-bold">SubRegion</TableHead>
                  <TableHead className="font-bold">Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => {
                  const isSelected = selected?.name === r.name;
                  return (
                    <TableRow
                      key={r.name}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-indigo-50 hover:bg-indigo-100"
                          : "hover:bg-accent/50"
                      }`}
                      onClick={() => onRowClick(r)}
                      // single-click selects & shows link
                    >
                      <TableCell className="font-medium">
                        <Link
                          target="_blank"
                          rel="noopener noreferrer"
                          href={`/ssl/vitals/${encodeURIComponent(r.name)}`}
                        >
                          {" "}
                          {r.name}{" "}
                        </Link>
                      </TableCell>
                      <TableCell>{r.district ?? "—"}</TableCell>
                      <TableCell>{r.grid ?? "—"}</TableCell>
                      <TableCell>{r.Siteclassification ?? "—"}</TableCell>
                      <TableCell>{r.subregion ?? "—"}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {r.address ?? "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Map */}
        <Card className="w-full h-[400px]">
          <SSlMap
            ref={mapRef}
            points={rows}
            selectedName={selected?.name ?? null}
            autoFit
          />
        </Card>
      </div>
    </div>
  );
}
