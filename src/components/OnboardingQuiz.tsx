import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { X, ChevronLeft, Loader2, Flame, Droplets, Dumbbell } from "lucide-react";
import { calculateGoals, type GoalCalculateRequest, type GoalCalculateResponse } from "@/services/goalsService";

interface Props {
  onDone: () => void;
}

const TOTAL_STEPS = 7;

export default function OnboardingQuiz({ onDone }: Props) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<GoalCalculateResponse | null>(null);
  const [data, setData] = useState<GoalCalculateRequest>({
    weight_kg: 70, height_cm: 170, age: 30, sex: "male",
    activity_level: "moderate", goal: "maintain",
    goal_weight_kg: undefined, body_fat_pct: undefined,
    macro_preset: "balanced",
  });

  const calcMut = useMutation({
    mutationFn: () => calculateGoals(data),
    onSuccess: (res) => { setResult(res); setStep(TOTAL_STEPS); },
  });

  function goBack() {
    if (step === 0) return;
    // Skip goal weight step if going back from macro and goal was maintain
    if (step === 5 && data.goal === "maintain") { setStep(3); return; }
    setStep(step - 1);
  }

  function finish() {
    qc.invalidateQueries({ queryKey: ["profile"] });
    qc.invalidateQueries({ queryKey: ["dailyStats"] });
    qc.invalidateQueries({ queryKey: ["water"] });
    qc.invalidateQueries({ queryKey: ["insight"] });
    onDone();
  }

  function Option({ label, desc, selected, onClick }: { label: string; desc?: string; selected: boolean; onClick: () => void }) {
    return (
      <button onClick={onClick}
        className="w-full p-4 text-start transition-all active:scale-[0.98] rounded-2xl"
        style={{
          backgroundColor: selected ? "color-mix(in srgb, var(--theme-accent) 8%, var(--bg-card-solid))" : "var(--bg-card-solid)",
          border: selected ? "2px solid var(--theme-accent)" : "1px solid var(--border)",
        }}>
        <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{label}</span>
        {desc && <p className="text-[11px] mt-1 leading-relaxed" style={{ color: "var(--text-muted)" }}>{desc}</p>}
      </button>
    );
  }

  function NextBtn({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
    return (
      <button onClick={onClick} disabled={disabled}
        className="w-full py-3.5 rounded-2xl text-white font-semibold transition-all active:scale-[0.98] disabled:opacity-50"
        style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}>
        {t("onboarding.next")}
      </button>
    );
  }

  // Step subtitles — explain WHY we ask
  const subtitles: Record<number, string> = {
    0: t("onboarding.sexWhy"),
    1: t("onboarding.bodyWhy"),
    2: t("onboarding.activityWhy"),
    3: t("onboarding.goalWhy"),
    4: t("onboarding.goalWeightWhy"),
    5: t("onboarding.macroWhy"),
  };

  const titles: Record<number, string> = {
    0: t("onboarding.sex"),
    1: t("onboarding.body"),
    2: t("onboarding.activity"),
    3: t("onboarding.goalQuestion"),
    4: t("onboarding.goalWeight"),
    5: t("onboarding.macroPreset"),
    6: t("onboarding.calculating"),
  };

  const steps = [
    // 0: Sex
    <div key="sex" className="space-y-3">
      {[{ v: "male", l: t("onboarding.male") }, { v: "female", l: t("onboarding.female") }].map((o) => (
        <Option key={o.v} label={o.l} selected={data.sex === o.v}
          onClick={() => { setData((d) => ({ ...d, sex: o.v })); setStep(1); }} />
      ))}
    </div>,

    // 1: Body
    <div key="body" className="space-y-4">
      {[
        { key: "age", label: t("onboarding.age"), unit: "" },
        { key: "height_cm", label: t("onboarding.height"), unit: "cm" },
        { key: "weight_kg", label: t("onboarding.weight"), unit: "kg" },
      ].map((f) => (
        <div key={f.key}>
          <label className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{f.label} {f.unit && `(${f.unit})`}</label>
          <input type="number" value={(data as unknown as Record<string, number>)[f.key]}
            onChange={(e) => setData((d: GoalCalculateRequest) => ({ ...d, [f.key]: +e.target.value || 0 }))}
            className="w-full rounded-2xl px-4 py-3.5 text-sm mt-1"
            style={{ backgroundColor: "var(--bg-card-solid)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
        </div>
      ))}
      <div>
        <label className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
          {t("onboarding.bodyFat")} <span className="opacity-60">({t("onboarding.optional")})</span>
        </label>
        <input type="number" step="0.1" value={data.body_fat_pct ?? ""} placeholder="%"
          onChange={(e) => setData((d) => ({ ...d, body_fat_pct: e.target.value ? +e.target.value : undefined }))}
          className="w-full rounded-2xl px-4 py-3.5 text-sm mt-1"
          style={{ backgroundColor: "var(--bg-card-solid)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
        <p className="text-[10px] mt-1.5" style={{ color: "var(--text-muted)" }}>{t("onboarding.bodyFatHint")}</p>
      </div>
      <NextBtn onClick={() => setStep(2)} />
    </div>,

    // 2: Activity
    <div key="activity" className="space-y-2.5">
      {["sedentary", "light", "moderate", "active", "very_active"].map((l) => (
        <Option key={l} label={t(`onboarding.${l}`)} selected={data.activity_level === l}
          onClick={() => { setData((d) => ({ ...d, activity_level: l })); setStep(3); }} />
      ))}
    </div>,

    // 3: Goal
    <div key="goal" className="space-y-2.5">
      {[
        { v: "aggressive_loss", l: t("onboarding.aggressiveLoss"), d: t("onboarding.aggressiveLossDesc") },
        { v: "moderate_loss", l: t("onboarding.moderateLoss"), d: t("onboarding.moderateLossDesc") },
        { v: "mild_loss", l: t("onboarding.mildLoss"), d: t("onboarding.mildLossDesc") },
        { v: "maintain", l: t("onboarding.maintain") },
        { v: "mild_gain", l: t("onboarding.mildGain"), d: t("onboarding.mildGainDesc") },
        { v: "moderate_gain", l: t("onboarding.moderateGain"), d: t("onboarding.moderateGainDesc") },
      ].map((g) => (
        <Option key={g.v} label={g.l} desc={g.d} selected={data.goal === g.v}
          onClick={() => { setData((d) => ({ ...d, goal: g.v })); setStep(g.v === "maintain" ? 5 : 4); }} />
      ))}
    </div>,

    // 4: Goal weight
    <div key="goalWeight" className="space-y-4">
      <input type="number" step="0.1" value={data.goal_weight_kg ?? ""} placeholder="kg"
        onChange={(e) => setData((d) => ({ ...d, goal_weight_kg: +e.target.value || undefined }))}
        className="w-full rounded-2xl px-4 py-3.5 text-sm"
        style={{ backgroundColor: "var(--bg-card-solid)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
      <NextBtn onClick={() => setStep(5)} />
    </div>,

    // 5: Macro preset
    <div key="macro" className="space-y-2.5">
      {[
        { v: "balanced", l: t("onboarding.balanced"), d: t("onboarding.balancedDesc") },
        { v: "high_protein", l: t("onboarding.highProtein"), d: t("onboarding.highProteinDesc") },
        { v: "keto", l: t("onboarding.keto"), d: t("onboarding.ketoDesc") },
      ].map((m) => (
        <Option key={m.v} label={m.l} desc={m.d} selected={data.macro_preset === m.v}
          onClick={() => { setData((d) => ({ ...d, macro_preset: m.v })); calcMut.mutate(); setStep(6); }} />
      ))}
    </div>,

    // 6: Calculating...
    <div key="calculating" className="flex flex-col items-center justify-center py-12">
      <Loader2 size={40} className="animate-spin mb-4" style={{ color: "var(--theme-accent)" }} />
      <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>{t("onboarding.calculatingDesc")}</p>
    </div>,
  ];

  // Results screen (step === TOTAL_STEPS)
  if (result && step === TOTAL_STEPS) {
    return (
      <div className="fixed inset-0 flex flex-col" style={{ backgroundColor: "var(--bg-page)", zIndex: 70 }}>
        <div className="flex-1 overflow-y-auto px-5 pt-8 pb-20 max-w-lg mx-auto w-full">
          <h1 className="text-[26px] font-bold tracking-tight mb-2 animate-fade-up" style={{ color: "var(--text-primary)" }}>
            {t("onboarding.yourPlan")}
          </h1>
          <p className="text-sm mb-6 animate-fade-up" style={{ color: "var(--text-muted)" }}>
            {t("onboarding.planDesc", { formula: result.formula_used === "katch_mcardle" ? "Katch-McArdle" : "Mifflin-St Jeor" })}
          </p>

          {/* Calorie card */}
          <div className="rounded-2xl p-5 mb-4 text-white text-center animate-fade-up stagger-1"
            style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}>
            <p className="text-4xl font-bold tracking-tighter">{result.daily_cal_goal.toLocaleString()}</p>
            <p className="text-sm opacity-80 mt-1">{t("onboarding.dailyCalories")}</p>
            <div className="flex justify-around mt-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.2)" }}>
              <div>
                <p className="text-xs opacity-60">BMR</p>
                <p className="text-sm font-bold">{result.bmr}</p>
              </div>
              <div>
                <p className="text-xs opacity-60">TDEE</p>
                <p className="text-sm font-bold">{result.tdee}</p>
              </div>
            </div>
          </div>

          {/* Macros */}
          <div className="grid grid-cols-3 gap-3 mb-4 animate-fade-up stagger-2">
            {[
              { icon: Dumbbell, label: t("macros.protein"), value: `${result.daily_protein_goal_g}${t("log.g")}`, color: "#6366f1" },
              { icon: Flame, label: t("macros.fat"), value: `${result.daily_fat_goal_g}${t("log.g")}`, color: "#f59e0b" },
              { icon: Flame, label: t("macros.carbs"), value: `${result.daily_carbs_goal_g}${t("log.g")}`, color: "#10b981" },
            ].map((m) => (
              <div key={m.label} className="glass-card-sm p-3.5 text-center">
                <m.icon size={18} className="mx-auto mb-1.5" style={{ color: m.color }} />
                <p className="text-lg font-bold" style={{ color: m.color }}>{m.value}</p>
                <p className="text-[9px] font-semibold uppercase tracking-wider mt-0.5" style={{ color: "var(--text-muted)" }}>{m.label}</p>
              </div>
            ))}
          </div>

          {/* Water */}
          <div className="glass-card-sm p-4 flex items-center gap-3 mb-6 animate-fade-up stagger-3">
            <Droplets size={20} color="#38bdf8" />
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t("onboarding.dailyWater")}</p>
            </div>
            <p className="text-lg font-bold" style={{ color: "#38bdf8" }}>{(result.daily_water_goal_ml / 1000).toFixed(1)}L</p>
          </div>

          {/* How we calculated */}
          <div className="glass-card-sm p-4 mb-6 animate-fade-up stagger-4">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>{t("onboarding.howCalculated")}</p>
            <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {t("onboarding.calculationExplanation", {
                bmr: result.bmr,
                tdee: result.tdee,
                goal: result.daily_cal_goal,
              })}
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3 animate-fade-up stagger-5">
            <button onClick={finish}
              className="w-full py-3.5 rounded-2xl text-white font-semibold transition-all active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}>
              {t("onboarding.looksGood")}
            </button>
            <button onClick={() => { setResult(null); setStep(0); }}
              className="w-full py-3 rounded-2xl text-sm font-medium transition-all active:scale-[0.98]"
              style={{ color: "var(--text-muted)" }}>
              {t("onboarding.adjust")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col" style={{ backgroundColor: "var(--bg-page)", zIndex: 70 }}>
      {/* Header: back + close + progress */}
      <div className="px-5 pb-2 max-w-lg mx-auto w-full" style={{ paddingTop: "calc(16px + env(safe-area-inset-top, 0px))" }}>
        <div className="flex items-center justify-between mb-4">
          {step > 0 ? (
            <button onClick={goBack} className="p-2 -ms-2 rounded-full transition-all active:scale-90" style={{ color: "var(--text-muted)" }}>
              <ChevronLeft size={22} />
            </button>
          ) : <div className="w-9" />}
          <button onClick={onDone} className="p-2 -me-2 rounded-full transition-all active:scale-90" style={{ color: "var(--text-muted)" }}>
            <X size={20} />
          </button>
        </div>
        {/* Progress — clickable dots */}
        <div className="flex gap-0 justify-center mb-2">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <button key={i} onClick={() => i < step && setStep(i)}
              disabled={i >= step}
              className="py-3 px-1 flex items-center justify-center"
              style={{ cursor: i < step ? "pointer" : "default", minWidth: 24, minHeight: 44 }}>
              <div className="h-2 rounded-full transition-all duration-300"
                style={{ width: i === step ? 24 : i < step ? 14 : 8, backgroundColor: i <= step ? "var(--theme-accent)" : "var(--bg-input)" }} />
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-20 max-w-lg mx-auto w-full">
        {step < TOTAL_STEPS && (
          <div className="mb-5">
            <h2 className="text-xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>{titles[step]}</h2>
            {subtitles[step] && (
              <p className="text-sm mt-1.5 leading-relaxed" style={{ color: "var(--text-muted)" }}>{subtitles[step]}</p>
            )}
          </div>
        )}
        {steps[step]}
      </div>
    </div>
  );
}
