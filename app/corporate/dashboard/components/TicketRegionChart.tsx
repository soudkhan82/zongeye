import { getTicketRegionCount } from "@/app/actions/dashboard";
import React from "react";
import { useState, useEffect } from "react";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface TicketRegionChart {
  acc_region: string;
  ticket_count: number;
}
const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7f50",
  "#a0522d",
  "#00bcd4",
];
function TicketRegionChart() {
  const [data, setData] = useState<TicketRegionChart[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getTicketRegionCount();
      setData(response.data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        return { success: false as const, message: err.message };
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  if (loading) return <p>Loading Region Chart...</p>;
  return (
    <div className="h-[500px] bg-gray-50">
      <h2 className="text-2xl font-semibold mb-4">Regional Breakup</h2>
      <div className="w-[450px] ">
        <ResponsiveContainer width="90%" height={400}>
          <PieChart>
            <Pie
              data={data}
              dataKey="ticket_count"
              nameKey="acc_region"
              cx="50%"
              cy="50%"
              outerRadius={150}
              label
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default TicketRegionChart;
