import { getTicketCategoryCount } from "@/app/actions/dashboard";
import React from "react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface TicketCategoryData {
  issue_type: string;
  ticket_count: number;
}
function TicketCatChart() {
  const [data, setData] = useState<TicketCategoryData[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getTicketCategoryCount();
      setData(response.data);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  if (loading) return <p>Loading chart...</p>;
  return (
    <div className="h-[500px] bg-gray-50">
      <h2 className="text-2xl font-semibold mb-4">Complaints by Issue Type</h2>
      <div className="w-[650px] ">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            width={800}
            data={data}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="issue_type" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="ticket_count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default TicketCatChart;
