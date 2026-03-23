import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { UtensilsCrossed, Droplets } from "lucide-react";
import { getDailyStats } from "@/services/statsService";
import { getProfile } from "@/services/profileService";
import { getTodayWater } from "@/services/waterService";
import CompetitionWidget from "@/components/CompetitionWidget";
import OnboardingQuiz from "@/components/OnboardingQuiz";
import DailyInsight from "@/components/DailyInsight";
import Modal from "@/components/Modal";
import LogFoodModal from "@/components/LogFoodModal";
import DrinkPickerModal from "@/components/DrinkPickerModal";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function getGreeting(t: (k: string) => string) {
  const h = new Date().getHours();
  if (h < 12) return t("dashboard.goodMorning");
  if (h < 18) return t("dashboard.goodAfternoon");
  return t("dashboard.goodEvening");
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [showAddFood, setShowAddFood] = useState(false);
  const [showAddDrink, setShowAddDrink] = useState(false);

  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: getProfile });
  const { data, isLoading } = useQuery({ queryKey: ["dailyStats", todayStr()], queryFn: () => getDailyStats(todayStr()) });
  const { data: water } = useQuery({ queryKey: ["water"], queryFn: getTodayWater });

  if (profile && !profile.onboarding_done) {
    return <OnboardingQuiz onDone={() => qc.invalidateQueries({ queryKey: ["profile"] })} />;
  }

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
             style={{ borderColor: "var(--border)", borderTopColor: "var(--theme-start)" }} />
      </div>
    );
  }

  const goal = data.goal_calories ?? 2000;
  const consumed = data.total_calories;
  const remaining = Math.max(goal - consumed, 0);
  const pct = Math.min(consumed / (goal || 1), 1);

  // Ring geometry
  const ringSize = 200;
  const stroke = 14;
  const r = (ringSize - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);

  const macros = [
    { label: t("macros.protein"), val: data.total_protein_g, goal: data.goal_protein_g, color: "#6366f1" },
    { label: t("macros.fat"), val: data.total_fat_g, goal: data.goal_fat_g, color: "#f59e0b" },
    { label: t("macros.carbs"), val: data.total_carbs_g, goal: data.goal_carbs_g, color: "#10b981" },
  ];

  const waterAmt = water?.amount_ml ?? 0;
  const waterGoal = water?.goal_ml ?? 2000;
  const waterPct = Math.min(waterAmt / (waterGoal || 1), 1);

  return (
    <div className="px-5 pt-8 pb-4 max-w-lg mx-auto">
      {/* Greeting + streak */}
      <div className="flex items-center justify-between mb-8 animate-fade-up">
        <h1 className="text-[26px] font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
          {getGreeting(t)}
        </h1>
        {profile && profile.current_streak > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: "color-mix(in srgb, var(--theme-accent) 12%, transparent)" }}>
            <span className="text-sm">🔥</span>
            <span className="text-xs font-bold tabular-nums" style={{ color: "var(--theme-accent)" }}>{profile.current_streak}</span>
          </div>
        )}
      </div>

      {/* Hero ring — floating, with glow */}
      <div className="flex flex-col items-center mb-6 animate-fade-up stagger-1">
        <div className="relative" style={{ width: ringSize, height: ringSize }}>
          {/* Glow effect behind the ring */}
          <div className="absolute inset-4 rounded-full opacity-20 blur-2xl"
            style={{ background: `radial-gradient(circle, var(--theme-start), transparent)` }} />
          <svg width={ringSize} height={ringSize} className="-rotate-90 relative z-10">
            <circle cx={ringSize/2} cy={ringSize/2} r={r} fill="none" strokeWidth={stroke}
              style={{ stroke: "var(--bg-input)" }} />
            <circle cx={ringSize/2} cy={ringSize/2} r={r} fill="none" strokeWidth={stroke}
              strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
              stroke="url(#ringGrad)" className="transition-all duration-1000 ease-out" />
            <defs>
              <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--theme-start)" />
                <stop offset="100%" stopColor="var(--theme-end)" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <span className="text-4xl font-bold tracking-tighter" style={{ color: "var(--text-primary)" }}>
              {consumed.toLocaleString()}
            </span>
            <span className="text-[13px] font-medium mt-0.5" style={{ color: "var(--text-muted)" }}>
              {t("dashboard.kcal")}
            </span>
          </div>
        </div>
        <p className="text-sm font-medium mt-2 tabular-nums" style={{ color: "var(--text-secondary)" }}>
          {remaining.toLocaleString()} {t("dashboard.left")} · {Math.round(pct * 100)}%
        </p>
      </div>

      {/* Macro pills — compact horizontal row */}
      <div className="flex gap-2 mb-6 animate-fade-up stagger-2">
        {macros.map((m) => {
          const p = m.goal ? Math.min(Math.round(m.val) / m.goal, 1) : 0;
          return (
            <div key={m.label} className="flex-1 glass-card-sm p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: m.color }}>{m.label}</span>
                <span className="text-[10px] font-medium tabular-nums" style={{ color: "var(--text-muted)" }}>
                  {Math.round(m.val)}/{m.goal ?? "–"}
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-input)" }}>
                <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${p * 100}%`, backgroundColor: m.color }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick actions — pill buttons side by side */}
      <div className="flex gap-3 mb-6 animate-fade-up stagger-3">
        <button onClick={() => setShowAddFood(true)}
          className="flex-1 glass-card-sm py-3.5 flex items-center justify-center gap-2.5 transition-all active:scale-[0.97]">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
            style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}>
            <UtensilsCrossed size={15} />
          </div>
          <span className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>{t("myday.addFood")}</span>
        </button>
        <button onClick={() => setShowAddDrink(true)}
          className="flex-1 glass-card-sm py-3.5 flex items-center justify-center gap-2.5 transition-all active:scale-[0.97]">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #38bdf8, #0ea5e9)" }}>
            <Droplets size={15} color="white" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>{t("myday.addDrink")}</span>
            {/* Mini water bar inside the button */}
            <div className="w-16 h-1 rounded-full mt-1 overflow-hidden" style={{ backgroundColor: "var(--bg-input)" }}>
              <div className="h-full rounded-full" style={{ width: `${waterPct * 100}%`, backgroundColor: "#38bdf8" }} />
            </div>
          </div>
        </button>
      </div>

      {/* Daily AI insight */}
      <div className="animate-fade-up stagger-4">
        <DailyInsight />
      </div>

      <CompetitionWidget />

      {/* Modals */}
      <Modal open={showAddFood} onClose={() => setShowAddFood(false)} title={t("log.title")}>
        <LogFoodModal onDone={() => { setShowAddFood(false); qc.invalidateQueries({ queryKey: ["dailyStats"] }); }} />
      </Modal>
      <Modal open={showAddDrink} onClose={() => setShowAddDrink(false)} title={t("myday.addDrink")}>
        <DrinkPickerModal onDone={() => setShowAddDrink(false)} />
      </Modal>
    </div>
  );
}
