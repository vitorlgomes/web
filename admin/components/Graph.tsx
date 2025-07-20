import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Props = {
  data: { date: string; revenue: number }[];
  title: string;
  subtitle: string;
};

// Custom Tooltip Component
const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { value: number }[];
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg bg-white px-4 py-2 text-center shadow-md">
        <span className="font-nohemi text-sm font-medium text-[#0B0C0B]">
          R$ {payload[0].value.toLocaleString("pt-BR")}
        </span>
      </div>
    );
  }
  return null;
};

export default function CustomGraph({ data, title, subtitle }: Props) {
  const finalDala = data.map((item) => ({
    date: item.date,
    value: item.revenue,
  }));

  return (
    <div className="rounded-lg bg-[#FAF9F6] p-6">
      {/* Title and Subtitle */}
      <div className="mb-6">
        <span className="font-nohemi text-base font-medium text-[#005930]">
          {title}
        </span>
        <p className="font-inter text-sm text-[#6D736D]">{subtitle}</p>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={finalDala}
          margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#005930" stopOpacity={1} />
              <stop offset="95%" stopColor="#005930" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: "#005930" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#005930" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: "#10B981", strokeWidth: 2, opacity: 0.2 }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#005930"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorValue)"
            activeDot={{
              r: 6,
              fill: "#10B981",
              stroke: "#FFFFFF",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
