"use client";

import { useEffect, useState } from "react";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Legend,
  Bar,
} from "recharts";
import {
  getAvailperMonth,
  getAvgAvailByCat,
  getBottom10Districts,
  getTop10Districts,
} from "../actions/avail";

import { getSubRegions } from "../actions/rt";


export default function AvailabilityPage() {
  const [subregions, setSubregions] = useState<string[]>([]);
  const [selectedSubregion, setSelectedSubregion] = useState<string>("");
  const [pgsData, setPgsData] = useState<
    { month: string; avg_availability: number }[]
  >([]);
  const [sbData, setSbData] = useState<
    { month: string; avg_availability: number }[]
  >([]);

  const [data, setData] = useState<
    { month: string; avg_availability: number }[]
  >([]);
  const [topData, setTopData] = useState([]);
  const [bottomData, setBottomData] = useState([]);

  useEffect(() => {
    getSubRegions().then(setSubregions);
  }, []);

  useEffect(() => {
    if (selectedSubregion) {
      getAvailperMonth(selectedSubregion).then(setData);
      getAvgAvailByCat(selectedSubregion, "PGS").then(setPgsData);
      getAvgAvailByCat(selectedSubregion, "SB").then(setSbData);
      getTop10Districts(selectedSubregion).then(setTopData);
      getBottom10Districts(selectedSubregion).then(setBottomData);
    }
  }, [selectedSubregion]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">
        Average Availability by SubRegion
      </h1>

      {/* Dropdown */}
      <Select onValueChange={setSelectedSubregion}>
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Select a subregion" />
        </SelectTrigger>
        <SelectContent>
          {subregions.map((sub) => (
            <SelectItem key={sub} value={sub}>
              {sub}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Shadcn Table */}
      <div className="flex flex-row gap-4 w-full">
        <div className="w-auto max-w-[300px] border rounded-xl p-4 bg-white shadow overflow-y-auto h-[400px]">
          <Table>
            <TableHeader className="bg-blue-100 text-blue-900">
              <TableRow>
                <TableHead className="font-bold text-lg">Month</TableHead>
                <TableHead className="font-bold text-lg">
                  Avg Availability (%)
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.month}>
                  <TableCell>{row.month}</TableCell>
                  <TableCell>{row.avg_availability.toFixed(3)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/*PGS Chart */}
        <div className="flex-1 border rounded-xl p-4 bg-white shadow h-[400px]">
          <h2 className="text-lg font-semibold mb-2"> PGS</h2>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={pgsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis
                domain={[70, 100]}
                tickCount={61}
                tickFormatter={(v) => v.toFixed(1)}
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="avg_availability"
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ r: 2 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/*SB Chart */}
        <div className="flex-1 border rounded-xl p-4 bg-white shadow h-[400px]">
          <h2 className="text-lg font-semibold mb-2">SB</h2>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sbData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis
                domain={[50, 100]}
                tickCount={50}
                tickFormatter={(v) => v.toFixed(1)}
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="avg_availability"
                stroke="#82ca9d"
                strokeWidth={2}
                dot={{ r: 2 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
        <div className="p-4 border rounded-xl shadow bg-white">
          <h2 className="font-bold text-lg mb-4 text-center">
            Top 10 Districts - {selectedSubregion}
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="district"
                angle={-45}
                textAnchor="end"
                height={60}
                dy={10}
              />
              <YAxis domain={[70, 100]} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="avg_availability"
                fill="#22c55e"
                name="Avg Availability"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="p-4 border rounded-xl shadow bg-white">
          <h2 className="font-bold text-lg mb-4 text-center">
            Bottom 10 Districts - {selectedSubregion}
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bottomData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="district"
                angle={-45}
                textAnchor="end"
                height={60}
                dy={10}
              />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="avg_availability"
                fill="#21c55e"
                name="Avg Availability"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
