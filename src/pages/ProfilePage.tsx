import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Shield, Palette, Clock, Target } from "lucide-react";
import { getProfile, updateProfile } from "@/services/profileService";
import { useAuth } from "@/hooks/useAuth";
import { themes, applyTheme, type ThemeName } from "@/themes/themes";
import { useState, useEffect } from "react";
import CatCollection from "@/components/CatCollection";
import EatingWindows from "@/components/EatingWindows";
import Modal from "@/components/Modal";

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: profile, isLoading } = useQuery({ queryKey: ["profile"], queryFn: getProfile });

  const updateMut = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });

  const [goals, setGoals] = useState({
    daily_cal_goal: 2000,
    daily_protein_goal_g: 120,
    daily_fat_goal_g: 78,
    daily_carbs_goal_g: 180,
    daily_water_goal_ml: 2000,
  });
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [showAppearanceModal, setShowAppearanceModal] = useState(false);
  const [showWindowsModal, setShowWindowsModal] = useState(false);
  const [activeTheme, setActiveTheme] = useState<ThemeName>("ocean");
  const [darkMode, setDarkMode] = useState<"auto" | "light" | "dark">("auto");

  useEffect(() => {
    if (profile) {
      setGoals({
        daily_cal_goal: profile.daily_cal_goal ?? 2000,
        daily_protein_goal_g: profile.daily_protein_goal_g ?? 120,
        daily_fat_goal_g: profile.daily_fat_goal_g ?? 78,
        daily_carbs_goal_g: profile.daily_carbs_goal_g ?? 180,
        daily_water_goal_ml: profile.daily_water_goal_ml ?? 2000,
      });
      setActiveTheme((profile.theme ?? "ocean") as ThemeName);
    }
    const saved = localStorage.getItem("nutrilog-dark-mode");
    if (saved) setDarkMode(saved as "auto" | "light" | "dark");
  }, [profile]);

  function saveGoals() {
    updateMut.mutate(goals);
    setShowGoalsModal(false);
  }

  function switchLanguage(lang: string) {
    i18n.changeLanguage(lang);
    document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
    updateMut.mutate({ language: lang });
  }

  function switchTheme(name: ThemeName) {
    setActiveTheme(name);
    applyTheme(name);
    localStorage.setItem("nutrilog-theme", name);
    updateMut.mutate({ theme: name });
  }

  function switchDarkMode(mode: "auto" | "light" | "dark") {
    setDarkMode(mode);
    localStorage.setItem("nutrilog-dark-mode", mode);
    const root = document.documentElement;
    root.classList.remove("force-dark", "force-light");
    if (mode === "dark") root.classList.add("force-dark");
    else if (mode === "light") root.classList.add("force-light");
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-transparent animate-spin"
             style={{ borderTopColor: "var(--theme-start)" }} />
      </div>
    );
  }

  const currentTheme = themes[activeTheme];
  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <h1 className="text-xl font-bold text-slate-900">{t("profile.title")}</h1>

      {/* User info */}
      <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="w-14 h-14 rounded-full" />
        ) : (
          <div className="w-14 h-14 rounded-full bg-slate-200" />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 truncate">{profile?.name}</p>
          <p className="text-xs text-slate-400 truncate">{profile?.email}</p>
          {profile?.username && <p className="text-xs text-slate-500 mt-0.5">@{profile.username}</p>}
        </div>
      </div>

      {/* Settings rows */}
      <div className="bg-white rounded-xl shadow-sm divide-y divide-slate-100">
        <button onClick={() => setShowGoalsModal(true)} className="w-full flex items-center gap-3 p-4">
          <Target size={18} style={{ color: "var(--theme-start)" }} />
          <span className="flex-1 text-start text-sm font-medium text-slate-700">{t("profile.goals")}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-300" style={{ transform: i18n.language === "he" ? "scaleX(-1)" : undefined }}><path d="m9 18 6-6-6-6"/></svg>
        </button>
        <button onClick={() => setShowAppearanceModal(true)} className="w-full flex items-center gap-3 p-4">
          <Palette size={18} style={{ color: "var(--theme-start)" }} />
          <span className="flex-1 text-start text-sm font-medium text-slate-700">{t("profile.appearance")}</span>
          <span className="w-6 h-6 rounded-full shrink-0" style={{ background: `linear-gradient(135deg, ${currentTheme.start}, ${currentTheme.end})` }} />
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-300" style={{ transform: i18n.language === "he" ? "scaleX(-1)" : undefined }}><path d="m9 18 6-6-6-6"/></svg>
        </button>
        <button onClick={() => setShowWindowsModal(true)} className="w-full flex items-center gap-3 p-4">
          <Clock size={18} style={{ color: "var(--theme-start)" }} />
          <span className="flex-1 text-start text-sm font-medium text-slate-700">{t("profile.eatingWindows")}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-300" style={{ transform: i18n.language === "he" ? "scaleX(-1)" : undefined }}><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>

      <CatCollection />

      {/* Language */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h2 className="font-semibold text-slate-700 mb-3">{t("profile.language")}</h2>
        <div className="flex gap-2">
          {[{ code: "en", label: "English" }, { code: "he", label: "עברית" }].map((lang) => (
            <button key={lang.code} onClick={() => switchLanguage(lang.code)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium border-2 transition-all ${
                i18n.language === lang.code ? "border-[var(--theme-start)] bg-slate-50" : "border-slate-100"
              }`}>
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {profile?.role === "admin" && (
        <button onClick={() => navigate("/admin")} className="w-full bg-white rounded-xl p-4 shadow-sm flex items-center gap-3 text-slate-700 font-medium">
          <Shield size={18} />
          <span className="flex-1 text-start">{t("admin.title")}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-300" style={{ transform: i18n.language === "he" ? "scaleX(-1)" : undefined }}><path d="m9 18 6-6-6-6"/></svg>
        </button>
      )}

      <button onClick={() => signOut()} className="w-full text-center text-sm text-red-400 py-3">{t("profile.signOut")}</button>

      {/* Goals modal */}
      <Modal open={showGoalsModal} onClose={() => setShowGoalsModal(false)} title={t("profile.goals")}>
        <div className="space-y-3">
          {([
            ["daily_cal_goal", t("profile.calories"), t("dashboard.kcal")],
            ["daily_protein_goal_g", t("macros.protein"), t("log.g")],
            ["daily_fat_goal_g", t("macros.fat"), t("log.g")],
            ["daily_carbs_goal_g", t("macros.carbs"), t("log.g")],
            ["daily_water_goal_ml", t("water.title"), t("water.ml")],
          ] as const).map(([key, label, unit]) => (
            <div key={key}>
              <label className="text-xs text-slate-400">{label} ({unit})</label>
              <input type="number" value={goals[key]} onChange={(e) => setGoals((g) => ({ ...g, [key]: +e.target.value || 0 }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mt-1" />
            </div>
          ))}
          <button onClick={saveGoals} disabled={updateMut.isPending}
            className="w-full py-2.5 rounded-lg text-white text-sm font-medium"
            style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}>
            {t("profile.save")}
          </button>
        </div>
      </Modal>

      {/* Appearance modal — theme + dark mode */}
      <Modal open={showAppearanceModal} onClose={() => setShowAppearanceModal(false)} title={t("profile.appearance")}>
        <h3 className="text-sm font-medium text-slate-700 mb-2">{t("profile.darkMode")}</h3>
        <div className="flex gap-2 mb-4">
          {(["auto", "light", "dark"] as const).map((mode) => (
            <button key={mode} onClick={() => switchDarkMode(mode)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                darkMode === mode ? "border-[var(--theme-start)] bg-slate-50" : "border-slate-100"
              }`}>
              {t(`profile.${mode}`)}
            </button>
          ))}
        </div>
        <h3 className="text-sm font-medium text-slate-700 mb-2">{t("profile.colorTheme")}</h3>
        <div className="grid grid-cols-3 gap-3">
          {(Object.entries(themes) as [ThemeName, (typeof themes)[ThemeName]][]).map(([name, theme]) => (
            <button key={name} onClick={() => switchTheme(name)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                activeTheme === name ? "border-[var(--theme-start)] bg-slate-50 scale-105" : "border-slate-100"
              }`}>
              <span className="w-8 h-8 rounded-full" style={{ background: `linear-gradient(135deg, ${theme.start}, ${theme.end})` }} />
              <span className="text-xs font-medium text-slate-700">{theme.label}</span>
            </button>
          ))}
        </div>
      </Modal>

      <Modal open={showWindowsModal} onClose={() => setShowWindowsModal(false)} title={t("profile.eatingWindows")}>
        <EatingWindows onClose={() => setShowWindowsModal(false)} />
      </Modal>
    </div>
  );
}
