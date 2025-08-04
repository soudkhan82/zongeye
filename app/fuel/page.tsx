"use client";
import { fetchFuelData } from "../actions/fuel";
import { FuelModel } from "@/interfaces";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import Loader from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
function FuelList() {
  const [data, setData] = useState<FuelModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [nameFilter, setNameFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const fetchData = async () => {
    console.log(nameFilter);
    console.log(districtFilter);
    setLoading(true);
    const { data, error } = await fetchFuelData({
      name: nameFilter,
      district: districtFilter,
    });
    if (error) {
      toast.error("Failed to fetch the data");
    } else {
      setData(data ?? []);
    }
    setLoading(false);
  };
  useEffect(() => {
    fetchData();
  }, []);

  // try {
  //   fuelrecords = await fetchFuelData();
  // } catch (error: any) {
  //   return (
  //     <div className="p-6">
  //       <p className="text-red-600 font-semibold">
  //         Failed to Load:{error.message}
  //       </p>
  //     </div>
  //   );

  return (
    <div className="w-1/2 p-6 space-y-6">
      <h1 className="text-xl font-bold">Fuel Records </h1>
      <div className="flex gap-4">
        <Input
          placeholder="Filter by Name"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          className="w-1/3"
        />
        <Input
          placeholder="Filter by District"
          value={districtFilter}
          onChange={(e) => setDistrictFilter(e.target.value)}
          className="w-1/3"
        />
        <button onClick={fetchData}>Filter</button>
      </div>
      {loading ? (
        <Loader />
      ) : (
        <div className="max-h-[500px] overflow-y-auto border rounded-lg ">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>District</TableHead>
                <TableHead>SubRegion</TableHead>
                <TableHead>Timeline</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length > 0 ? (
                data.map((record) => (
                  <TableRow key={`${record.id}-${record.name}`}>
                    <TableCell>{record.id}</TableCell>
                    <TableCell>{record.name}</TableCell>
                    <TableCell>{record.quantity}</TableCell>
                    <TableCell>{record.district}</TableCell>
                    <TableCell>{record.subregion}</TableCell>
                    <TableCell>
                      {record.timeline
                        ? new Date(record.timeline).toLocaleDateString()
                        : ""}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6}>No Matching records</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default FuelList;
