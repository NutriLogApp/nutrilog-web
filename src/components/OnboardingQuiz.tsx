import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { calculateGoals, type GoalCalculateRequest } from "@/services/goalsService";

interface Props {
  onDone: () => void;
}

export default function OnboardingQuiz({ onDone }: Props) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<GoalCalculateRequest>({
    weight_kg: 70, height_cm: 170, age: 30, sex: "male",
    activity_level: "moderate", goal: "maintain", goal_weight_kg: undefined,
  });

  const calcMut = useMutation({
    mutationFn: () => calculateGoals(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["profile"] }); onDone(); },
  });

  const steps = [
    // Step 0: Sex
    <div key="sex" className="space-y-3">
      <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>{t("onboarding.sex")}</h3>
      {[{ v: "male", l: t("onboarding.male") }, { v: "female", l: t("onboarding.female") }].map((o) => (
        <button key={o.v} onClick={() => { setData((d) => ({ ...d, sex: o.v })); setStep(1); }}
          className="w-full glass-card-sm p-4 text-start font-medium transition-all active:scale-[0.98]"
          style={{ color: "var(--text-primary)", borderColor: data.sex === o.v ? "var(--theme-accent)" : "var(--border)" }}>
          {o.l}
        </button>
      ))}
    </div>,
    // Step 1: Body
    <div key="body" className="space-y-4">
      <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>{t("onboarding.body")}</h3>
      {[
        { key: "age", label: t("onboarding.age"), unit: "", min: 10, max: 100 },
        { key: "height_cm", label: t("onboarding.height"), unit: "cm", min: 100, max: 250 },
        { key: "weight_kg", label: t("onboarding.weight"), unit: "kg", min: 30, max: 300 },
      ].map((f) => (
        <div key={f.key}>
          <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{f.label} {f.unit && `(${f.unit})`}</label>
          <input type="number" value={(data as unknown as Record<string, number>)[f.key]}
            onChange={(e) => setData((d: GoalCalculateRequest) => ({ ...d, [f.key]: +e.target.value || 0 }))}
            className="w-full rounded-xl px-4 py-3 text-sm mt-1"
            style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
          />
        </div>
      ))}
      <button onClick={() => setStep(2)}
        className="w-full py-3 rounded-xl text-white font-semibold transition-all active:scale-[0.98]"
        style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}>
        {t("onboarding.next")}
      </button>
    </div>,
    // Step 2: Activity
    <div key="activity" className="space-y-3">
      <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>{t("onboarding.activity")}</h3>
      {["sedentary", "light", "moderate", "active", "very_active"].map((l) => (
        <button key={l} onClick={() => { setData((d) => ({ ...d, activity_level: l })); setStep(3); }}
          className="w-full glass-card-sm p-4 text-start transition-all active:scale-[0.98]"
          style={{ color: "var(--text-primary)" }}>
          <span className="font-medium">{t(`onboarding.${l}`)}</span>
        </button>
      ))}
    </div>,
    // Step 3: Goal
    <div key="goal" className="space-y-3">
      <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>{t("onboarding.goalQuestion")}</h3>
      {["lose", "maintain", "gain"].map((g) => (
        <button key={g} onClick={() => { setData((d) => ({ ...d, goal: g })); setStep(g === "maintain" ? 5 : 4); }}
          className="w-full glass-card-sm p-4 text-start font-medium transition-all active:scale-[0.98]"
          style={{ color: "var(--text-primary)" }}>
          {t(`onboarding.${g}`)}
        </button>
      ))}
    </div>,
    // Step 4: Goal weight
    <div key="goalWeight" className="space-y-4">
      <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>{t("onboarding.goalWeight")}</h3>
      <input type="number" step="0.1" value={data.goal_weight_kg ?? ""}
        onChange={(e) => setData((d) => ({ ...d, goal_weight_kg: +e.target.value || undefined }))}
        placeholder="kg"
        className="w-full rounded-xl px-4 py-3 text-sm"
        style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
      <button onClick={() => setStep(5)}
        className="w-full py-3 rounded-xl text-white font-semibold transition-all active:scale-[0.98]"
        style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}>
        {t("onboarding.next")}
      </button>
    </div>,
    // Step 5: Calculate
    <div key="done" className="text-center space-y-4">
      <div className="text-4xl mb-2">🐱</div>
      <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>{t("onboarding.ready")}</h3>
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>{t("onboarding.readyDesc")}</p>
      <button onClick={() => calcMut.mutate()} disabled={calcMut.isPending}
        className="w-full py-3 rounded-xl text-white font-semibold transition-all active:scale-[0.98]"
        style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}>
        {calcMut.isPending ? "..." : t("onboarding.calculate")}
      </button>
    </div>,
  ];

  return (
    <div className="px-5 pt-10 pb-4 max-w-lg mx-auto" style={{ minHeight: "100vh", backgroundColor: "var(--bg-page)" }}>
      {/* Progress dots */}
      <div className="flex gap-1.5 mb-8 justify-center">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-1.5 rounded-full transition-all duration-300"
            style={{ width: i <= step ? 24 : 8, backgroundColor: i <= step ? "var(--theme-accent)" : "var(--bg-input)" }} />
        ))}
      </div>
      {steps[step]}
    </div>
  );
}
