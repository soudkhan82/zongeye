"use client";

import {
  getActionsByRegion,
  getActionsByStatus,
  getActionsByType,
  getAllActions,
} from "@/app/actions/tasks";
import {
  ActionItem,
  ActionTypeCount,
  RegionCount,
  StatusCount,
} from "@/interfaces";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ActionsDashboard() {
  const [regionData, setRegionData] = useState<RegionCount[]>([]);
  const [typeData, setTypeData] = useState<ActionTypeCount[]>([]);
  const [statusData, setStatusData] = useState<StatusCount[]>([]);
  const [allActions, setAllActions] = useState<ActionItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [regionResult, typeResult, statusResult, allResult] =
        await Promise.all([
          getActionsByRegion(),
          getActionsByType(),
          getActionsByStatus(),
          getAllActions(),
        ]);

      if (regionResult) setRegionData(regionResult);
      if (typeResult) setTypeData(typeResult);
      if (statusResult) setStatusData(statusResult);
      if (allResult) setAllActions(allResult);
    };

    fetchData();
  }, []);

  // Count tasks by status
  const totalCount = allActions.length;
  const InProgressCount = allActions.filter(
    (a) => a.status.toLowerCase() === "in-progress"
  ).length;
  const closedCount = allActions.filter(
    (a) => a.status.toLowerCase() === "closed"
  ).length;

  return (
    <div className="p-3">
      <div className="flex items-center justify-between p-2">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Actions Dashboard
        </h1>

        <div className="flex gap-2">
          <Button>
            <Link href="./tasks/add">Add Ticket</Link>
          </Button>
          <Button>
            <Link href="../tasks">Tasks Table</Link>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {totalCount > 0 && (
          <Card className="bg-blue-100 shadow">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-blue-900 flex justify-center">
                Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-center text-blue-700">
                {totalCount}
              </p>
            </CardContent>
          </Card>
        )}
        {InProgressCount > 0 && (
          <Card className="bg-yellow-100 shadow">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-yellow-900 flex justify-center">
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-center text-yellow-700">
                {InProgressCount}
              </p>
            </CardContent>
          </Card>
        )}
        {closedCount > 0 && (
          <Card className="bg-green-100 shadow">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-green-900 flex justify-center">
                Closed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-center text-green-700">
                {closedCount}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {/* Chart 1: By Region */}
        <div className="bg-white p-1 rounded shadow">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Actions by Region
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={regionData}>
              <XAxis dataKey="region" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#8884d8" name="Actions" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2: By Action Type */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Actions by Type
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={typeData}>
              <XAxis dataKey="action_type" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#82ca9d" name="Actions" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 3: By Status */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Actions by Status
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData}>
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#ffc658" name="Actions" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="mt-1">
        <h2 className="text-2xl font-semibold">All Actions</h2>
        <div className="bg-white p-6 rounded shadow h-[300px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="font-bold text-gray-700">ID</TableHead>
                <TableHead className="font-bold text-gray-700">Title</TableHead>
                <TableHead className="font-bold text-gray-700">
                  Region
                </TableHead>
                <TableHead className="font-bold text-gray-700">
                  Status
                </TableHead>
                <TableHead className="font-bold text-gray-700">
                  Action Type
                </TableHead>
                <TableHead className="font-bold text-gray-700">
                  Target Timeline
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allActions.map((action) => (
                <TableRow key={action.id}>
                  <TableCell>
                    <Link href={`/tasks/detail/${action.id}`}>{action.id}</Link>
                  </TableCell>
                  <TableCell>{action.title}</TableCell>
                  <TableCell>{action.region}</TableCell>
                  <TableCell>{action.status}</TableCell>
                  <TableCell>{action.ActionType}</TableCell>
                  <TableCell>
                    {new Date(action.created_at).toLocaleDateString() ?? ""}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
