import React from "react";

function DashboardCard({
  title,
  value,
  caption,
}: {
  title: string;
  value: number;
  caption: string;
}) {
  return (
    <div className="bg-gray-100 border border-gray-300 p-1 flex flex-col gap-1 rounded w-full">
      <h1 className="text-sm text-center font-bold uppercase">{title}</h1>
      <h1 className="text-center text-6xl">{value}</h1>
      <h1 className="text-xs text-center text-gray-500">{caption}</h1>
    </div>
  );
}

export default DashboardCard;
