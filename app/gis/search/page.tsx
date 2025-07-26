"use client";
import React from "react";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import supabase from "../../config/supabase-config";
import L from "leaflet";
import { getAllpoints } from "../../actions/gis";
import toast from "react-hot-toast";
import Loader from "@/components/ui/loader";
import { TableHeader } from "@/components/ui/table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { GeoPoint } from "@/interfaces";
import PageTitle from "@/components/ui/page-title";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Edit2 } from "lucide-react";
import { useRouter } from "next/navigation";
import ErrorMessage from "@/components/ui/error-message";
const columns = ["Name", "SiteClassification", "District", "Address", "Edit"];

function GISMapList() {
  const [points, setPoints] = useState<GeoPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchArea, setSearchArea] = useState("");
  const [submittedsearch, setSubmittedSearch] = useState("");
  const [submittedAreasearch, setSubmittedAreaSearch] = useState("");
  const router = useRouter();
  const fetchData = async (searchterm: string, page: number) => {
    try {
      setLoading(true);
      const { data, total_records } = await getAllpoints(
        searchterm,
        searchArea,
        page
      );
      console.log(data);
      setPoints(data);
      setTotal(total_records);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData(submittedsearch, page);
  }, [submittedsearch, submittedAreasearch, page]);
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSubmittedSearch(search);
    setSubmittedAreaSearch(searchArea);
  };
  const center: any =
    points.length > 0
      ? [points[0].Latitude, points[0].Longitude]
      : [33.6844, 73.0479]; // Default center (Islamabad)

  return (
    <div>
      <form onSubmit={handleSearch} className="flex gap-2 mb-1 m-5">
        <input
          placeholder="Enter Search...."
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          placeholder="Enter Area...."
          type="text"
          value={searchArea}
          onChange={(e) => setSearchArea(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          Search
        </button>
      </form>
      {loading && <Loader />}
      {!loading && points.length > 0 && (
        <div className="flex h-screen w-screen gap-4 p-12">
          <div className="flex-1 overflow-y-auto bg-gray-50">
            <Table>
              <TableHeader className=" bg-pink-300">
                <TableRow>
                  {columns.map((col) => (
                    <TableHead
                      key={col}
                      className="font font-extrabold font-stretch-normal"
                    >
                      {col}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {points.map((point: GeoPoint) => (
                  <TableRow key={point.id} className="p-2">
                    <TableCell>
                      <Link href={`/gis/detail/${point.id}`}>{point.Name}</Link>
                    </TableCell>

                    <TableCell>{point.SiteClassification}</TableCell>
                    <TableCell>{point.District}</TableCell>
                    <TableCell>{point.Address}</TableCell>

                    <TableCell
                      data-label="actions"
                      className="flex gap-5 items-center"
                    >
                      <Button
                        variant={"outline"}
                        size={"icon"}
                        className="cursor-pointer"
                        onClick={() => router.push(`/tasks/edit/${point.id}`)}
                      >
                        <Edit2 size={14} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex gap-2 mt-1">
              <Button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="px-3 py-1">Page {page}</span>
              <Button
                onClick={() => setPage((p) => p + 1)}
                disabled={points.length < 5}
              >
                NEXT
              </Button>
              <p>Total Records are {total} </p>
            </div>
          </div>
          <div className="flex-1 ">
            <MapContainer
              center={center}
              zoom={11}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {points.map((point) => (
                <Marker
                  key={point.id}
                  position={
                    [point.Latitude, point.Longitude] as [number, number]
                  }
                  icon={L.icon({
                    iconUrl:
                      "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                  })}
                >
                  <Popup>{point.Name}</Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      )}
      {!loading && points.length === 0 && (
        <div>
          <ErrorMessage error="No Records" />
        </div>
      )}
      <PageTitle title="Geographical Information" />

      <MapContainer
        center={center}
        zoom={11}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.map((point) => (
          <Marker
            key={point.id}
            position={[point.Latitude, point.Longitude] as [number, number]}
            icon={L.icon({
              iconUrl:
                "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
            })}
          >
            <Popup>{point.Name}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default GISMapList;
