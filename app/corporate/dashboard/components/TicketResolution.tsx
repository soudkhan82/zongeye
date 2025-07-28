import { getAvgResolution } from "@/app/actions/dashboard";
import React, { useEffect } from "react";

interface TicketResolutionData {
  Issue_Type: string;
  avg_duration: number;
}

function TicketResolution() {
  const [data, setData] = React.useState<TicketResolutionData[]>([]);
  const [loading, setLoading] = React.useState(false);
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getAvgResolution();
      setData(response.data);
      console.log(response.data);
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
  if (loading) return <p>Calculating Resolution Time...</p>;
  return (
    <div className=" bg-gray-100 h-[500px] ">
      <h1 className="text-xl font-bold text-gray-800 mb-6">
        Avg Resolution Duration by Issue Type
      </h1>

      <div className="grid grid-cols-2 w-[500px] gap-1">
        {data.map((item, idx) => (
          <div
            key={idx}
            className="bg-white shadow-md rounded-xl p-6 border border-gray-100 hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold text-indigo-600 mb-2">
              {item.Issue_Type}
            </h2>
            <p className="text-gray-700">
              <span className="font-medium text-gray-900">
                Average Duration:
              </span>{" "}
              {Number(item.avg_duration).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {data.length === 0 && (
        <p className="text-center text-gray-500 mt-10">No data to display</p>
      )}
    </div>
  );
}

export default TicketResolution;
