import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { UtensilsCrossed, Droplets, Zap } from "lucide-react";
import { getDailyStats } from "@/services/statsService";
import { todayLocal } from "@/lib/dateUtils";
import { getProfile } from "@/services/profileService";
import { getTodayWater } from "@/services/waterService";
import CompetitionWidget from "@/components/CompetitionWidget";
import OnboardingQuiz from "@/components/OnboardingQuiz";
import DailyInsight from "@/components/DailyInsight";
import Modal from "@/components/Modal";
import LogFoodModal from "@/components/LogFoodModal";
import DrinkPickerModal from "@/components/DrinkPickerModal";


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
  const { data, isLoading } = useQuery({ queryKey: ["dailyStats", todayLocal()], queryFn: () => getDailyStats(todayLocal()) });
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
  const isOver = consumed > goal;

  // Macro calorie contributions
  const proteinCal = data.total_protein_g * 4;
  const fatCal = data.total_fat_g * 9;
  const carbsCal = data.total_carbs_g * 4;
  const totalMacroCal = proteinCal + fatCal + carbsCal;

  // Segmented ring geometry
  const ringR = 68;
  const ringStroke = 12;
  const circ = 2 * Math.PI * ringR;
  const segmentBase = isOver ? totalMacroCal : goal;

  const macroSegments = [
    { cal: proteinCal, color: "#6366f1" },
    { cal: fatCal, color: "#f59e0b" },
    { cal: carbsCal, color: "#10b981" },
  ].filter((s) => s.cal > 0);

  // Build dash offsets for each segment
  let segmentOffset = 0;
  const segments = macroSegments.map((s) => {
    const len = (s.cal / (segmentBase || 1)) * circ;
    const o = segmentOffset;
    segmentOffset += len;
    return { ...s, dashLen: len, offset: o };
  });

  const remainingArc = isOver ? 0 : circ - segmentOffset;

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
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "var(--bg-card)" }}>
            <Zap size={14} fill="#f59e0b" stroke="#f59e0b" />
            <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
              {profile?.current_streak || 0} {t("dashboard.dayStreak")}
            </span>
          </div>
        )}
      </div>

      {/* Ring + Macros side-by-side */}
      <style>{`@keyframes pulse-red { 0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0) } 50% { box-shadow: 0 0 20px 4px rgba(239,68,68,0.3) } }`}</style>
      <div className="flex gap-4 items-center mb-6 animate-fade-up stagger-1">
        {/* Left: Segmented ring */}
        <div className="flex-1 flex justify-center">
          <div className="relative" style={{ width: 160, height: 160, borderRadius: "50%", animation: isOver ? "pulse-red 2s ease-in-out infinite" : undefined }}>
            <svg viewBox="0 0 160 160" width={160} height={160} className="-rotate-90 relative z-10">
              {/* Background ring */}
              <circle cx={80} cy={80} r={ringR} fill="none" strokeWidth={ringStroke}
                style={{ stroke: "var(--bg-input)" }} />
              {/* Macro segments */}
              {segments.map((s, i) => (
                <circle key={i} cx={80} cy={80} r={ringR} fill="none"
                  strokeWidth={ringStroke}
                  stroke={s.color}
                  strokeDasharray={`${s.dashLen} ${circ - s.dashLen}`}
                  strokeDashoffset={-s.offset}
                  className="transition-all duration-1000 ease-out" />
              ))}
              {/* Remaining gray arc (only if under budget and there's space) */}
              {!isOver && remainingArc > 0 && totalMacroCal > 0 && (
                <circle cx={80} cy={80} r={ringR} fill="none"
                  strokeWidth={ringStroke}
                  style={{ stroke: "var(--bg-input)" }}
                  strokeDasharray={`${remainingArc} ${circ - remainingArc}`}
                  strokeDashoffset={-segmentOffset} />
              )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              <span className="text-4xl font-bold tracking-tighter" style={{ color: isOver ? "#ef4444" : "var(--text-primary)" }}>
                {consumed.toLocaleString()}
              </span>
              {isOver ? (
                <>
                  <span className="text-[13px] font-medium mt-0.5" style={{ color: "#ef4444" }}>
                    +{(consumed - goal).toLocaleString()} {t("dashboard.over")}
                  </span>
                  <span className="sr-only">{t("dashboard.overBudget")}</span>
                </>
              ) : (
                <span className="text-[13px] font-medium mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {t("dashboard.ofXKcal", { x: goal.toLocaleString() })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Macro cards stacked */}
        <div className="flex-1 flex flex-col gap-3">
          {macros.map((m) => {
            const p = m.goal ? Math.min(Math.round(m.val) / m.goal, 1) : 0;
            return (
              <div key={m.label} className="glass-card-sm p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: m.color }}>{m.label}</span>
                  <span className="text-[11px] font-medium tabular-nums" style={{ color: "var(--text-muted)" }}>
                    {Math.round(m.val)}/{m.goal ?? "–"}
                  </span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-input)" }}>
                  <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${p * 100}%`, backgroundColor: m.color }} />
                </div>
              </div>
            );
          })}
        </div>
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
