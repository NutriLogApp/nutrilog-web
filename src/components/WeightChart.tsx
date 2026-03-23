import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getWeightHistory, logWeight } from "@/services/weightService";

export default function WeightChart() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [input, setInput] = useState("");

  const { data } = useQuery({ queryKey: ["weightHistory"], queryFn: getWeightHistory });

  const logMut = useMutation({
    mutationFn: () => logWeight(parseFloat(input)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["weightHistory"] });
      setInput("");
    },
  });

  const chartData = (data ?? []).map((e) => ({
    date: e.date.slice(5),
    weight: e.weight_kg,
  }));

  return (
    <div className="rounded-xl p-4 shadow-sm mt-4" style={{ backgroundColor: "var(--bg-card)" }}>
      <h2 className="text-sm font-medium mb-3" style={{ color: "var(--text-secondary)" }}>{t("weight.title")}</h2>

      {chartData.length > 1 && (
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} width={35} domain={["dataMin - 1", "dataMax + 1"]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="var(--theme-start)"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      <div className="flex gap-2 mt-3">
        <input
          type="number"
          step="0.1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("weight.placeholder")}
          className="flex-1 border rounded-lg px-3 py-2 text-sm"
          style={{ borderColor: "var(--border)" }}
        />
        <button
          onClick={() => logMut.mutate()}
          disabled={!input || logMut.isPending}
          className="px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}
        >
          {t("weight.log")}
        </button>
      </div>
    </div>
  );
}
