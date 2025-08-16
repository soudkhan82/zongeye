"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  fetchDataStats,
  fetchDataTraffic,
  getDistricts,
} from "@/app/actions/rt";
import { getSubregions } from "@/app/actions/filters";
import { DataStats, DataTraffic } from "@/interfaces";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import DataHeatmap, { DataMapHandle } from "@/app/gis/components/DataHeatMap";

function DataTrafficPage() {
  const [stats, setStats] = useState<DataStats | null>(null);
  const [sites, setSites] = useState<DataTraffic[]>([]);
  const [districtoptions, setDistrictoptions] = useState<string[]>([]);
  const [selDistrict, setselDistrict] = useState<string>();
  const [selectedSubRegion, setSelectedSubRegion] = useState<string>("");
  const [subregionOptions, setSubregionOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const mapRef = useRef<DataMapHandle>(null);

  useEffect(() => {
    (async () => {
      try {
        const d = await getDistricts(selectedSubRegion);
        setDistrictoptions(d);
      } catch (e) {
        console.error("Failed to load districts", e);
      }
    })();
  }, [selectedSubRegion]);

  useEffect(() => {
    getSubregions().then(setSubregionOptions);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!selectedSubRegion) {
        setSites([]);
        setStats(null);
        return;
      }
      setLoading(true);
      try {
        const [siteRows, statRow] = await Promise.all([
          fetchDataTraffic(selectedSubRegion, selDistrict ?? null),
          fetchDataStats(selectedSubRegion, selDistrict ?? null),
        ]);
        if (!cancelled) {
          setSites(siteRows);
          setStats(statRow);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedSubRegion, selDistrict]);

  function fmt(n: number | null | undefined, opts?: Intl.NumberFormatOptions) {
    return n == null ? "—" : n.toLocaleString(undefined, opts);
  }

  return (
    <div className="w-full p-4 space-y-4">
      <h1 className="text-2xl font-bold text-center my-6 text-indigo-700">
        Geo-Analytics Data Traffic
      </h1>

      <div className="w-full flex justify-start space-x-3">
        <Select
          onValueChange={(v) => { setSelectedSubRegion(v); setselDistrict(undefined); }}
          value={selectedSubRegion ?? ""}
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select a subregion" />
          </SelectTrigger>
          <SelectContent>
            {subregionOptions.map((sub) => (
              <SelectItem key={sub} value={sub}>{sub}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={(v) => setselDistrict(v)} value={selDistrict ?? ""}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select district" />
          </SelectTrigger>
          <SelectContent>
            {districtoptions.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {sites.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card className="bg-pink-100"><CardHeader><CardTitle>Distinct Sites</CardTitle></CardHeader><CardContent>{fmt(stats?.distinct_sites)}</CardContent></Card>
          <Card className="bg-pink-100"><CardHeader><CardTitle>Average Data3G(GB)</CardTitle></CardHeader><CardContent>{fmt(stats?.avg_data3g)}</CardContent></Card>
          <Card className="bg-pink-100"><CardHeader><CardTitle>Average Data4G(GB)</CardTitle></CardHeader><CardContent>{fmt(stats?.avg_data4g)}</CardContent></Card>
          <Card className="bg-pink-100"><CardHeader><CardTitle>Total Data Revenue(PKR)</CardTitle></CardHeader><CardContent>{fmt(stats?.total_data_revenue)}</CardContent></Card>
          <Card className="bg-pink-100"><CardHeader><CardTitle>Avg Data Revenue(PKR)</CardTitle></CardHeader><CardContent>{fmt(stats?.avg_data_revenue)}</CardContent></Card>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {/* Table */}
        <Card className="w-full h-fit">
          <CardContent className="overflow-auto max-h-[400px]">
            {loading && <div className="text-center text-gray-500">Loading...</div>}
            <Table className="mt-4 bg-green-100 rounded-lg overflow-hidden">
              <TableHeader className="bg-gray-200">
                <TableRow>
                  <TableHead className="font-bold">Name</TableHead>
                  <TableHead className="font-bold">Data3G</TableHead>
                  <TableHead className="font-bold">Data4G</TableHead>
                  <TableHead className="font-bold">DataRev</TableHead>
                  <TableHead className="font-bold">Classification</TableHead>
                  <TableHead className="font-bold">District</TableHead>
                  <TableHead className="font-bold">SubRegion</TableHead>
                  <TableHead className="font-bold">Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sites.map((site) => (
                  <TableRow
                    key={site.name}
                    className="cursor-pointer hover:bg-gray-200"
                    onClick={() => {
                      // zoom map to clicked row
                      mapRef.current?.flyTo(site.longitude, site.latitude, 15.5);
                    }}
                  >
                    <TableCell>{site.name}</TableCell>
                    <TableCell>{site.data3gtraffic}</TableCell>
                    <TableCell>{site.data4gtraffic}</TableCell>
                    <TableCell>{fmt(site.datarevenue)}</TableCell>
                    <TableCell>{site.siteclassification}</TableCell>
                    <TableCell>{site.district}</TableCell>
                    <TableCell>{site.subregion}</TableCell>
                    <TableCell>{site.address}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Map */}
        <Card className="relative w-full h-[500px]">
          <div className="absolute z-10 right-3 top-3 flex gap-2">
            <button
              onClick={() => mapRef.current?.fitToPoints(60)}
              className="px-3 py-1 text-xs rounded-md bg-white shadow border"
              title="Reset view"
            >
              Reset view
            </button>
          </div>
          <div className="absolute inset-0">
            <DataHeatmap ref={mapRef} points={sites} focusZoom={15.5} />
          </div>
        </Card>
      </div>
    </div>
  );
}

export default DataTrafficPage;
