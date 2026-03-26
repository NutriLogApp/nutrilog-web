import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from "recharts";
import type { WeightEntry } from "@/services/weightService";

interface Props {
  data: WeightEntry[];
}

export default function WeightChart({ data }: Props) {
  const chartData = data.map((w) => ({
    date: `${w.date.slice(8)}/${w.date.slice(5, 7)}`, // "DD/MM"
    weight: w.weight_kg,
  }));

  return (
    <ResponsiveContainer width="100%" height={140}>
      <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--theme-accent)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="var(--theme-accent)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--text-muted)" }} tickLine={false} axisLine={false} />
        <YAxis domain={["dataMin - 1", "dataMax + 1"]} tick={{ fontSize: 10, fill: "var(--text-muted)" }} tickLine={false} axisLine={false} />
        <Area type="monotone" dataKey="weight" stroke="var(--theme-accent)" strokeWidth={2} fill="url(#weightGradient)" dot={{ r: 3, fill: "var(--theme-accent)" }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
