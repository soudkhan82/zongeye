"use client";

import { useEffect, useState } from "react";
import { fetchVoiceTraffic } from "@/app/actions/rt";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useMap } from "react-leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Set up Leaflet's default icon paths
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
const smallDotIcon = L.divIcon({
  className: "custom-dot-icon",
  iconSize: [8, 8], // Width x Height in pixels
  iconAnchor: [4, 4], // Center the dot
});

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import "leaflet/dist/leaflet.css";
import { VoiceTraffic } from "@/interfaces";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getSubRegions } from "@/app/actions/avail";

import { Card, CardContent } from "@/components/ui/card";

export default function VoiceTrafficPage() {
  const [sites, setSites] = useState<VoiceTraffic[]>([]);
  const [selectedSubRegion, setSelectedSubRegion] = useState<string>("");
  const [subregionOptions, setSubregionOptions] = useState<string[]>([]);
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(
    null
  );
  const MapFocus = ({ coords }: { coords: [number, number] | null }) => {
    const map = useMap();

    useEffect(() => {
      if (coords) {
        map.flyTo(coords, 15); // zoom level 15, adjust as needed
      }
    }, [coords, map]);

    return null;
  };
  useEffect(() => {
    getSubRegions().then(setSubregionOptions);
  }, []);
  useEffect(() => {
    if (selectedSubRegion) {
      fetchVoiceTraffic(selectedSubRegion).then(setSites);
      console.log(selectedSubRegion);
      console.log(sites);
    }
  }, [selectedSubRegion]);

  return (
    <div className="w-full p-4 space-y-4">
      <div className="w-full flex justify-start">
        <Select onValueChange={setSelectedSubRegion}>
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
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {/* Table */}
        <Card className="w-full h-fit">
          <CardContent className="overflow-auto max-h-[400px]">
            <Table>
              <TableHeader className="bg-gray-200">
                <TableRow>
                  <TableHead className="font-bold">Name</TableHead>
                  <TableHead className="font-bold">Voice2G_E</TableHead>
                  <TableHead className="font-bold">Voice3G_E</TableHead>
                  <TableHead className="font-bold">VoLTE</TableHead>
                  <TableHead className="font-bold">Classification</TableHead>
                  <TableHead className="font-bold">SubRegion</TableHead>
                  <TableHead className="font-bold">Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sites.map((site) => (
                  <TableRow
                    className="cursor-pointer hover:bg-gray-200"
                    key={site.name}
                    onClick={() =>
                      setSelectedCoords([site.latitude, site.longitude])
                    }
                  >
                    <TableCell>{site.name}</TableCell>
                    <TableCell>{site.voice2gtraffic}</TableCell>
                    <TableCell>{site.voice3gtraffic}</TableCell>
                    <TableCell>{site.voltetraffic}</TableCell>
                    <TableCell>{site.siteclassification}</TableCell>
                    <TableCell>{site.subregion}</TableCell>
                    <TableCell>{site.address}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        {/* Map */}
        <Card className="w-full h-fit">
          <CardContent className="p-0">
            <MapContainer
              center={[30.0, 70.0]}
              zoom={5}
              scrollWheelZoom={false}
              style={{ height: "400px", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="© OpenStreetMap contributors"
              />
              {selectedCoords && <MapFocus coords={selectedCoords} />}
              {sites.map((site) => {
                const lat = site.latitude;
                const lng = site.longitude;
                if (isNaN(lat) || isNaN(lng)) return null;

                return (
                  <Marker
                    key={site.name}
                    position={[lat, lng]}
                    icon={smallDotIcon}
                  >
                    <Popup>
                      <strong>{site.name}</strong>
                      <br />
                      Traffic2G:<b> {site.voice2gtraffic} </b> <br />
                      Traffic3G: <b> {site.voice3gtraffic} </b>
                      <br />
                      Site Classification: <b> {site.siteclassification} </b>
                      <br />
                      Site Address : {site.address}
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
