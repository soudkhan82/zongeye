import React from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { getAvailAll } from "../actions/avail";
import { Availability } from "@/interfaces";
import AvailabilityChart from "./components/AvailChart";

async function AvailabilityList() {
  let data: Availability[] = [];

  try {
    data = await getAvailAll();
    console.log(data);
  } catch (error: any) {
    return (
      <div className="p-6">
        <p className="text-red-600 font-semibold">
          Failed to Load:{error.message}
        </p>
      </div>
    );
  }
  return (
    <div>
      <h1 className="flex justify-center text-2xl font-bold">
        Availability Statistics
      </h1>
      <div className=" flex gap-6 p-6">
        <div className="mt-5 w-1/2 rounded-xl border max-h-[400px] overflow-auto shadow-sm bg-gray-300">
          <Table>
            <TableHeader className="sticky top-0 bg-white z-10 text-xl font-extrabold">
              <TableRow>
                <TableHead>Serial</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>
                  <b> Site ID</b>
                </TableHead>
                <TableHead>SubRegion</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Group</TableHead>
                <TableHead>Avail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.month}</TableCell>
                  <TableCell>
                    <b> {row.SITE_ID} </b>
                  </TableCell>
                  <TableCell>{row.Region}</TableCell>
                  <TableCell>{row.SubRegion}</TableCell>
                  <TableCell>{row.CAT}</TableCell>
                  <TableCell className="">{row.Availability}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-5 w-1/2 bg-white rounded-xl p-4 border max-h-[400px]  shadow-sm">
          <AvailabilityChart />
        </div>
      </div>
    </div>
  );
}

export default AvailabilityList;
