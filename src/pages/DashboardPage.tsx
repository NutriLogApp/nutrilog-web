import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { UtensilsCrossed, Droplets } from "lucide-react";
import { getDailyStats } from "@/services/statsService";
import { getProfile } from "@/services/profileService";
import { getTodayWater, addWater } from "@/services/waterService";
import { listDrinks } from "@/services/drinksService";
import { useMutation } from "@tanstack/react-query";
import i18n from "@/i18n";
import PetCat from "@/components/PetCat";
import CompetitionWidget from "@/components/CompetitionWidget";
import UnlockNotification from "@/components/UnlockNotification";
import OnboardingQuiz from "@/components/OnboardingQuiz";
import Modal from "@/components/Modal";
import LogFoodModal from "@/components/LogFoodModal";

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

  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: getProfile });
  const { data, isLoading } = useQuery({ queryKey: ["dailyStats", todayStr()], queryFn: () => getDailyStats(todayStr()) });
  const { data: water } = useQuery({ queryKey: ["water"], queryFn: getTodayWater });
  const { data: drinks } = useQuery({ queryKey: ["drinks"], queryFn: listDrinks });

  const waterMut = useMutation({
    mutationFn: (ml: number) => addWater(ml),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["water"] }),
  });

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
  const ringSize = 180;
  const strokeWidth = 16;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);

  const macros = [
    { label: t("macros.protein"), value: data.total_protein_g, goal: data.goal_protein_g, color: "#6366f1" },
    { label: t("macros.fat"), value: data.total_fat_g, goal: data.goal_fat_g, color: "#f59e0b" },
    { label: t("macros.carbs"), value: data.total_carbs_g, goal: data.goal_carbs_g, color: "#10b981" },
  ];

  const waterAmt = water?.amount_ml ?? 0;
  const waterGoal = water?.goal_ml ?? 2000;

  return (
    <div className="px-5 pt-6 pb-4 max-w-lg mx-auto space-y-5">
      {/* Header */}
      <div className="animate-fade-up">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>{getGreeting(t)}</h1>
      </div>

      {/* Hero: Calorie ring centered */}
      <div className="glass-card p-6 flex flex-col items-center animate-fade-up stagger-1">
        <div className="relative" style={{ width: ringSize, height: ringSize }}>
          <svg width={ringSize} height={ringSize} className="-rotate-90">
            <circle cx={ringSize/2} cy={ringSize/2} r={radius} fill="none" strokeWidth={strokeWidth} style={{ stroke: "var(--bg-input)" }} />
            <circle cx={ringSize/2} cy={ringSize/2} r={radius} fill="none" strokeWidth={strokeWidth} strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset} stroke="url(#calGrad)" className="transition-all duration-700 ease-out" />
            <defs>
              <linearGradient id="calGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--theme-start)" />
                <stop offset="100%" stopColor="var(--theme-end)" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>{consumed.toLocaleString()}</span>
            <span className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>/ {goal.toLocaleString()} {t("dashboard.kcal")}</span>
          </div>
        </div>
        <p className="text-sm font-medium mt-3" style={{ color: "var(--text-secondary)" }}>
          {remaining.toLocaleString()} {t("dashboard.kcal")} {t("dashboard.left")}
        </p>

        {/* Macro bars inline */}
        <div className="w-full mt-4 space-y-2.5">
          {macros.map((m) => {
            const p = m.goal ? Math.min(Math.round(m.value) / m.goal, 1) : 0;
            return (
              <div key={m.label} className="flex items-center gap-3">
                <span className="text-[11px] font-semibold w-16 text-end" style={{ color: m.color }}>{m.label}</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-input)" }}>
                  <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${p * 100}%`, backgroundColor: m.color }} />
                </div>
                <span className="text-[11px] font-medium tabular-nums w-16" style={{ color: "var(--text-muted)" }}>
                  {Math.round(m.value)}/{m.goal ?? "–"}{t("log.g")}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick actions row */}
      <div className="flex gap-3 animate-fade-up stagger-2">
        <button onClick={() => setShowAddFood(true)}
          className="flex-1 glass-card-sm p-4 flex flex-col items-center gap-2 transition-all active:scale-[0.97]">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
            style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}>
            <UtensilsCrossed size={18} />
          </div>
          <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{t("myday.addFood")}</span>
        </button>
        <button onClick={() => waterMut.mutate(250)}
          className="flex-1 glass-card-sm p-4 flex flex-col items-center gap-2 transition-all active:scale-[0.97]">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #38bdf8, #0ea5e9)" }}>
            <Droplets size={18} color="white" />
          </div>
          <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{t("myday.addDrink")}</span>
          <span className="text-[10px] tabular-nums" style={{ color: "var(--text-muted)" }}>
            {waterAmt}/{waterGoal}{t("water.ml")}
          </span>
        </button>
      </div>

      {/* Quick drink chips */}
      {drinks && drinks.length > 0 && (
        <div className="flex gap-2 flex-wrap animate-fade-up stagger-3">
          {drinks.map((d) => (
            <button key={d.id} onClick={() => {
              if (d.counts_as_water) waterMut.mutate(d.volume_ml);
              if (d.calories > 0) {
                import("@/services/entriesService").then(({ createEntry }) => {
                  const isHe = i18n.language === "he";
                  createEntry({
                    description: isHe && d.name_he ? d.name_he : d.name,
                    source: "text", meal_type: "snack",
                    items: [{ food_name: d.name, food_name_he: d.name_he, grams: d.volume_ml, calories: d.calories, protein_g: d.protein_g, fat_g: d.fat_g, carbs_g: d.carbs_g, confidence: "high" as const }],
                  }).then(() => qc.invalidateQueries({ queryKey: ["dailyStats"] }));
                });
              }
            }}
              className="glass-card-sm px-3 py-2 text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95"
              style={{ color: "var(--text-secondary)" }}>
              {d.icon} {i18n.language === "he" && d.name_he ? d.name_he : d.name}
            </button>
          ))}
        </div>
      )}

      {/* Pet */}
      <PetCat />

      {/* Competition */}
      <CompetitionWidget />

      {/* Add food modal */}
      <Modal open={showAddFood} onClose={() => setShowAddFood(false)} title={t("log.title")}>
        <LogFoodModal onDone={() => { setShowAddFood(false); qc.invalidateQueries({ queryKey: ["dailyStats"] }); }} />
      </Modal>

      <UnlockNotification />
    </div>
  );
}
