"use client";

import { useEffect, useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { VoiceStats, VoiceTraffic } from "@/interfaces";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getSubregions } from "@/app/actions/filters";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import VoiceMap from "@/app/gis/components/VoiceHeatMap";
import {
  fetchVoiceStats,
  fetchVoiceTraffic,
  getDistricts,
} from "@/app/actions/rt";
import VoiceHeatmap from "@/app/gis/components/VoiceHeatMap";

//Helper function to compute statistics

export default function VoiceTrafficPage() {
  const [stats, setStats] = useState<VoiceStats | null>(null);
  const [sites, setSites] = useState<VoiceTraffic[]>([]);
  const [districtoptions, setDistrictoptions] = useState<string[]>([]);
  const [selDistrict, setselDistrict] = useState<string>();
  const [selectedSubRegion, setSelectedSubRegion] = useState<string>("");
  const [subregionOptions, setSubregionOptions] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);

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
        setselDistrict(undefined);
        return;
      }
      setLoading(true);
      try {
        const [siteRows, statRow] = await Promise.all([
          fetchVoiceTraffic(selectedSubRegion, selDistrict ?? null),
          fetchVoiceStats(selectedSubRegion, selDistrict ?? null),
        ]);
        if (!cancelled) {
          setSites(siteRows);
          setStats(statRow);
          console.log(sites);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedSubRegion, selDistrict]);

  function fmt(n: number | null | undefined, opts?: Intl.NumberFormatOptions) {
    return n === null || typeof n === "undefined"
      ? "—"
      : n.toLocaleString(undefined, opts);
  }
  return (
    <div className="w-full p-4 space-y-4">
      <h1 className="text-2xl font-bold text-center my-6 text-indigo-700">
        Geo-Analytics Voice Traffic
      </h1>
      <div className="w-full flex justify-start space-x-3">
        <Select
          onValueChange={(v) => {
            setSelectedSubRegion(v);
            setselDistrict(undefined);
          }}
          value={selectedSubRegion ?? ""}
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select a subregion" />
          </SelectTrigger>
          <SelectContent>
            {subregionOptions.map((sub) => (
              <SelectItem key={sub} value={sub}>
                {sub}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          onValueChange={(v) => setselDistrict(v)}
          value={selDistrict ?? ""}
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select district" />
          </SelectTrigger>
          <SelectContent>
            {districtoptions.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {sites.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card className="bg-pink-100">
            <CardHeader>
              <CardTitle>Distinct Sites</CardTitle>
            </CardHeader>
            <CardContent>{fmt(stats?.distinct_sites)}</CardContent>
          </Card>
          <Card className="bg-pink-100">
            <CardHeader>
              <CardTitle>Average Voice 2G(Erl)</CardTitle>
            </CardHeader>
            <CardContent>{fmt(stats?.avg_voice2g)}</CardContent>
          </Card>
          <Card className="bg-pink-100">
            <CardHeader>
              <CardTitle>Average Voice 3G(Erl)</CardTitle>
            </CardHeader>
            <CardContent>{fmt(stats?.avg_voice3g)}</CardContent>
          </Card>
          <Card className="bg-pink-100">
            <CardHeader>
              <CardTitle>Average VoiceLTE(Erl)</CardTitle>
            </CardHeader>
            <CardContent>{fmt(stats?.avg_voicelte)}</CardContent>
          </Card>

          <Card className="bg-pink-100">
            <CardHeader>
              <CardTitle>Total Voice Revenue(PKR)</CardTitle>
            </CardHeader>
            <CardContent>{fmt(stats?.total_voice_revenue)}</CardContent>
          </Card>
          <Card className="bg-pink-100">
            <CardHeader>
              <CardTitle>Avg Voice Revenue(PKR)</CardTitle>
            </CardHeader>
            <CardContent>{fmt(stats?.avg_voice_revenue)}</CardContent>
          </Card>
        </div>
      )}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Table */}
        <Card className="w-full h-fit">
          <CardContent className="overflow-auto max-h-[400px]">
            {loading && (
              <div className="text-center text-gray-500">Loading...</div>
            )}
            <Table className="mt-4 bg-green-100 rounded-lg overflow-hidden">
              <TableHeader className="bg-gray-200">
                <TableRow>
                  <TableHead className="font-bold">Name</TableHead>
                  <TableHead className="font-bold">Voice2G_E</TableHead>
                  <TableHead className="font-bold">Voice3G_E</TableHead>
                  <TableHead className="font-bold">VoLTE</TableHead>
                  <TableHead className="font-bold">Classification</TableHead>
                  <TableHead className="font-bold">District</TableHead>
                  <TableHead className="font-bold">SubRegion</TableHead>
                  <TableHead className="font-bold">Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sites.map((site) => (
                  <TableRow
                    className="cursor-pointer hover:bg-gray-200"
                    key={site.name}
                    // onClick={() =>
                    //   // setSelectedCoords([site.latitude, site.longitude])
                    //   setSelectedsite(site)
                    // }
                  >
                    <TableCell>{site.name}</TableCell>
                    <TableCell>{site.voice2gtraffic}</TableCell>
                    <TableCell>{site.voice3gtraffic}</TableCell>
                    <TableCell>{site.voltetraffic}</TableCell>
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
        <Card className="w-full h-[400px]">
          <VoiceHeatmap points={sites} />
        </Card>
      </div>
    </div>
  );
}
