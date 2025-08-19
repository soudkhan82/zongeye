"use client";

import { useEffect, useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { getSubregions } from "@/app/actions/filters";
import { getDistricts } from "@/app/actions/rt";
import { getLatestPoints } from "@/app/actions/gis";

import PointSizeMap, {
  MapPoint as SizeMapPoint,
  KpiKey,
} from "@/app/gis/components/PointSizeMap";

type LatestKpiRow = {
  Name: string;
  Region: string | null;
  SubRegion: string | null;
  District: string | null;
  Grid: string | null;
  Address: string | null;
  SiteClassification: string | null;
  Longitude: number | null;
  Latitude: number | null;
  Month: string | null;
  MFULTotalRev: number | string | null;
  MFULDataRev: number | string | null;
  MFULVoiceRev: number | string | null;
  data4GTrafficGB: number | string | null;
  data3GTrafficGB: number | string | null;
  voice2GTrafficE: number | string | null;
  voice3GTrafficE: number | string | null;
  voLTEVoiceTrafficE: number | string | null;
};

const KPI_OPTIONS: { key: KpiKey; label: string }[] = [
  { key: "MFULTotalRev", label: "Total Revenue" },
  { key: "MFULDataRev", label: "Data Revenue" },
  { key: "MFULVoiceRev", label: "Voice Revenue" },
  { key: "data4GTrafficGB", label: "4G Data (GB)" },
  { key: "data3GTrafficGB", label: "3G Data (GB)" },
  { key: "voice2GTrafficE", label: "Voice 2G (Erl)" },
  { key: "voice3GTrafficE", label: "Voice 3G (Erl)" },
  { key: "voLTEVoiceTrafficE", label: "VoLTE (Erl)" },
];

export default function VoiceTrafficPage() {
  const [selectedSubRegion, setSelectedSubRegion] = useState<string>("North-1");
  const [selDistrict, setSelDistrict] = useState<string>("");

  const [subregionOptions, setSubregionOptions] = useState<string[]>([]);
  const [districtOptions, setDistrictOptions] = useState<string[]>([]);
  const [kpiKey, setKpiKey] = useState<KpiKey>("MFULTotalRev");

  const [loading, setLoading] = useState(false);
  const [points, setPoints] = useState<SizeMapPoint[]>([]);

  // Load subregions once
  useEffect(() => {
    getSubregions().then(setSubregionOptions).catch(console.error);
  }, []);

  // When subregion changes, load districts
  useEffect(() => {
    (async () => {
      setSelDistrict("");
      if (!selectedSubRegion) {
        setDistrictOptions([]);
        return;
      }
      try {
        const d = await getDistricts(selectedSubRegion);
        setDistrictOptions(d);
      } catch (e) {
        console.error("Failed to load districts", e);
        setDistrictOptions([]);
      }
    })();
  }, [selectedSubRegion]);

  // Fetch latest points based on filters
  const loadPoints = async () => {
    setLoading(true);
    try {
      const data = (await getLatestPoints(
        selectedSubRegion || undefined,
        selDistrict || undefined
      )) as LatestKpiRow[];

      const mapped: SizeMapPoint[] = data.map((r) => ({
        Name: r.Name,
        SubRegion: r.SubRegion,
        District: r.District,
        Grid: r.Grid,
        SiteClassification: r.SiteClassification,
        Longitude: r.Longitude,
        Latitude: r.Latitude,
        Address: r.Address,
        MFULTotalRev: r.MFULTotalRev,
        MFULDataRev: r.MFULDataRev,
        MFULVoiceRev: r.MFULVoiceRev,
        data4GTrafficGB: r.data4GTrafficGB,
        data3GTrafficGB: r.data3GTrafficGB,
        voice2GTrafficE: r.voice2GTrafficE,
        voice3GTrafficE: r.voice3GTrafficE,
        voLTEVoiceTrafficE: r.voLTEVoiceTrafficE,

        Month: r.Month,
      }));

      setPoints(mapped);
    } catch (e) {
      console.error(e);
      setPoints([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadPoints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canApply = useMemo(
    () => !!selectedSubRegion || !!selDistrict,
    [selectedSubRegion, selDistrict]
  );

  return (
    <div className="w-full p-4 space-y-4">
      <h1 className="text-2xl font-bold text-center my-6 text-indigo-700">
        Latest KPI — Point Size Map
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
        <div className="space-y-1">
          <Label>SubRegion</Label>
          <Select
            value={selectedSubRegion}
            onValueChange={(v) => {
              setSelectedSubRegion(v);
              setSelDistrict("");
            }}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select subregion" />
            </SelectTrigger>
            <SelectContent>
              {subregionOptions.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>District</Label>
          <Select
            value={selDistrict}
            onValueChange={setSelDistrict}
            disabled={!selectedSubRegion}
          >
            <SelectTrigger className="w-64">
              <SelectValue
                placeholder={
                  selectedSubRegion
                    ? "Select district"
                    : "Select subregion first"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {districtOptions.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* KPI selector */}
        <div className="space-y-1">
          <Label>Size by KPI</Label>
          <Select value={kpiKey} onValueChange={(v) => setKpiKey(v as KpiKey)}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select KPI" />
            </SelectTrigger>
            <SelectContent>
              {KPI_OPTIONS.map(({ key, label }) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="opacity-0">Apply</Label>
          <Button onClick={loadPoints} disabled={loading || !canApply}>
            {loading ? "Loading..." : "Apply Filters"}
          </Button>
        </div>
      </div>

      <div className="h-[72vh] rounded-xl border overflow-hidden">
        {loading ? (
          <div className="h-full flex items-center justify-center bg-muted/30">
            Loading latest KPI points…
          </div>
        ) : (
          <PointSizeMap points={points} kpiKey={kpiKey} />
        )}
      </div>
    </div>
  );
}
