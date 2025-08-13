"use client";
import { AvailabilityPoint, siteVitals } from "@/interfaces";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { AreaChart, Area, Legend } from "recharts";

function fmt(n: number | null | undefined, opts?: Intl.NumberFormatOptions) {
  return n === null || typeof n === "undefined"
    ? "—"
    : n.toLocaleString(undefined, opts);
}
type ChartSpec = {
  title: string;
  key: keyof siteVitals;
  yTick?: (v: number) => string;
  tooltipFmt?: (v: number) => string;
  stroke: string;
  fill: string;
};
const compact = (n: number) =>
  n?.toLocaleString(undefined, {
    notation: "compact",
    maximumFractionDigits: 1,
  });
const currency = (n: number) =>
  n?.toLocaleString(undefined, {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  });

const CHARTS: ChartSpec[] = [
  {
    title: "Voice Traffic (2G)",
    key: "voice2GTrafficE",
    yTick: compact,
    tooltipFmt: compact,
    stroke: "#6366F1",
    fill: "#6366F1",
  },
  {
    title: "Voice Traffic (3G)",
    key: "voice3GTrafficE",
    yTick: compact,
    tooltipFmt: compact,
    stroke: "#22C55E",
    fill: "#22C55E",
  },
  {
    title: "Voice Traffic (LTE)",
    key: "voLTEVoiceTrafficE",
    yTick: compact,
    tooltipFmt: compact,
    stroke: "#F59E0B",
    fill: "#F59E0B",
  },
  {
    title: "Data Traffic (3G, GB)",
    key: "data3GTrafficGB",
    yTick: compact,
    tooltipFmt: compact,
    stroke: "#EF4444",
    fill: "#EF4444",
  },
  {
    title: "Data Traffic (4G, GB)",
    key: "data4GTrafficGB",
    yTick: compact,
    tooltipFmt: compact,
    stroke: "#06B6D4",
    fill: "#06B6D4",
  },
  {
    title: "Voice Revenue (PKR)",
    key: "MFULVoiceRev",
    yTick: compact,
    tooltipFmt: currency,
    stroke: "#8B5CF6",
    fill: "#8B5CF6",
  },
  {
    title: "Data Revenue (PKR)",
    key: "MFULDataRev",
    yTick: compact,
    tooltipFmt: currency,
    stroke: "#10B981",
    fill: "#10B981",
  },
  {
    title: "Total Revenue (PKR)",
    key: "MFULTotalRev",
    yTick: compact,
    tooltipFmt: currency,
    stroke: "#F43F5E",
    fill: "#F43F5E",
  },
];

function UniformAreaChart({ data, spec }: { data: siteVitals[]; spec: ChartSpec }) {
  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-2">{spec.title}</h3>
      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="Month" />
            <YAxis tickFormatter={spec.yTick} />
            <Tooltip
              formatter={(v: number) =>
                spec.tooltipFmt ? spec.tooltipFmt(v) : v?.toLocaleString()
              }
              labelFormatter={(l) => `Month: ${l}`}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey={spec.key as string}
              stroke={spec.stroke}
              fill={spec.fill}
              fillOpacity={0.25}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export default function MapView({
  avail,
  vitals,
  title,
}: {
  avail: AvailabilityPoint[];
  vitals: siteVitals[];
  title: string;
}) {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Availability — {title}</h1>

      {/* Availability Chart + Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <Card className="p-4">
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={avail}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[40, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(v: number) => `${v.toFixed(2)}%`} />
                <Line
                  type="monotone"
                  dataKey="availability"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="max-h-[320px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Name</TableHead>
                  <TableHead className="text-right">Voice2GE</TableHead>
                  <TableHead className="text-right">Voice3GE</TableHead>
                  <TableHead className="text-right">VoLTE</TableHead>
                  <TableHead className="text-right">Data3G_GB</TableHead>
                  <TableHead className="text-right">Data4G_GB</TableHead>
                  <TableHead className="text-right">VoiceRev</TableHead>
                  <TableHead className="text-right">DataRev</TableHead>
                  <TableHead className="text-right">TotalRev</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vitals.length ? (
                  vitals.map((v) => (
                    <TableRow key={`${v.Name}-${v.Month}`}>
                      <TableCell>{v.Month}</TableCell>
                      <TableCell className="text-right">{v.Name}</TableCell>
                      <TableCell className="text-right">
                        {fmt(v.voice2GTrafficE)}
                      </TableCell>
                      <TableCell className="text-right">
                        {fmt(v.voice3GTrafficE)}
                      </TableCell>
                      <TableCell className="text-right">
                        {fmt(v.voLTEVoiceTrafficE)}
                      </TableCell>
                      <TableCell className="text-right">
                        {fmt(v.data3GTrafficGB)}
                      </TableCell>
                      <TableCell className="text-right">
                        {fmt(v.data4GTrafficGB)}
                      </TableCell>
                      <TableCell className="text-right">
                        {fmt(v.MFULVoiceRev)}
                      </TableCell>
                      <TableCell className="text-right">
                        {fmt(v.MFULDataRev)}
                      </TableCell>
                      <TableCell className="text-right">
                        {fmt(v.MFULTotalRev)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="text-center text-sm text-muted-foreground"
                    >
                      No vitals found for this site.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Uniform Area Charts */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-3">KPI Trends</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {CHARTS.map((spec) => (
            <UniformAreaChart key={spec.title} data={vitals} spec={spec} />
          ))}
        </div>
      </div>
    </div>
  );
}
