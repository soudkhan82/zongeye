"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fetchAvailperMonth } from "@/app/actions/avail";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

type AvailabilityData = {
  month: string;
  avg_avail: number;
};

export default function AvailabilityChart() {
  const [chartData, setChartData] = useState<AvailabilityData[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchAvailperMonth();
        setChartData(data);
        console.log(data);
      } catch (error) {
        toast.error(`Error fetching`);
      }
    };

    loadData();
  }, []);

  return (
    <div className="p-6 w-full max-w-4xl">
      <h2 className="text-xl font-semibold mb-4">
        Average Availability per Month
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <Tooltip formatter={(v: number) => `${v.toFixed(2)}%`} />
          <Line
            type="monotone"
            dataKey="avg_avail"
            stroke="#10b981"
            strokeWidth={2}
            dot
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
