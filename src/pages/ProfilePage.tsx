import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Shield, Palette, Clock, ChevronRight } from "lucide-react";
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

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  const updateMut = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });

  const [goals, setGoals] = useState({
    daily_cal_goal: 2000,
    daily_protein_goal_g: 120,
    daily_fat_goal_g: 78,
    daily_carbs_goal_g: 180,
  });
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showWindowsModal, setShowWindowsModal] = useState(false);
  const [activeTheme, setActiveTheme] = useState<ThemeName>("ocean");

  useEffect(() => {
    if (profile) {
      setGoals({
        daily_cal_goal: profile.daily_cal_goal ?? 2000,
        daily_protein_goal_g: profile.daily_protein_goal_g ?? 120,
        daily_fat_goal_g: profile.daily_fat_goal_g ?? 78,
        daily_carbs_goal_g: profile.daily_carbs_goal_g ?? 180,
      });
      setActiveTheme((profile.theme ?? "ocean") as ThemeName);
    }
  }, [profile]);

  function saveGoals() {
    updateMut.mutate(goals);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-transparent animate-spin"
          style={{ borderTopColor: "var(--theme-start)" }}
        />
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
          {profile?.username && (
            <p className="text-xs text-slate-500 mt-0.5">@{profile.username}</p>
          )}
        </div>
      </div>

      {/* Goals */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h2 className="font-semibold text-slate-700 mb-3">{t("profile.goals")}</h2>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              ["daily_cal_goal", t("profile.calories"), "kcal"],
              ["daily_protein_goal_g", t("macros.protein"), "g"],
              ["daily_fat_goal_g", t("macros.fat"), "g"],
              ["daily_carbs_goal_g", t("macros.carbs"), "g"],
            ] as const
          ).map(([key, label, unit]) => (
            <div key={key}>
              <label className="text-xs text-slate-400">{label} ({unit})</label>
              <input
                type="number"
                value={goals[key]}
                onChange={(e) => setGoals((g) => ({ ...g, [key]: +e.target.value || 0 }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mt-1"
              />
            </div>
          ))}
        </div>
        <button
          onClick={saveGoals}
          disabled={updateMut.isPending}
          className="w-full mt-3 py-2.5 rounded-lg text-white text-sm font-medium"
          style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}
        >
          {t("profile.save")}
        </button>
      </div>

      {/* Quick settings row */}
      <div className="bg-white rounded-xl shadow-sm divide-y divide-slate-100">
        <button
          onClick={() => setShowThemeModal(true)}
          className="w-full flex items-center gap-3 p-4"
        >
          <Palette size={18} style={{ color: "var(--theme-start)" }} />
          <div className="flex-1 text-start">
            <p className="text-sm font-medium text-slate-700">{t("profile.theme")}</p>
          </div>
          <span
            className="w-6 h-6 rounded-full shrink-0"
            style={{ background: `linear-gradient(135deg, ${currentTheme.start}, ${currentTheme.end})` }}
          />
          <ChevronRight size={16} className="text-slate-300" />
        </button>
        <button
          onClick={() => setShowWindowsModal(true)}
          className="w-full flex items-center gap-3 p-4"
        >
          <Clock size={18} style={{ color: "var(--theme-start)" }} />
          <div className="flex-1 text-start">
            <p className="text-sm font-medium text-slate-700">{t("profile.eatingWindows")}</p>
          </div>
          <ChevronRight size={16} className="text-slate-300" />
        </button>
      </div>

      {/* Cat collection */}
      <CatCollection />

      {/* Language */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h2 className="font-semibold text-slate-700 mb-3">{t("profile.language")}</h2>
        <div className="flex gap-2">
          {[
            { code: "en", label: "English" },
            { code: "he", label: "עברית" },
          ].map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchLanguage(lang.code)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium border-2 transition-all ${
                i18n.language === lang.code
                  ? "border-[var(--theme-start)] bg-slate-50"
                  : "border-slate-100 hover:border-slate-200"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Admin link */}
      {profile?.role === "admin" && (
        <button
          onClick={() => navigate("/admin")}
          className="w-full bg-white rounded-xl p-4 shadow-sm flex items-center gap-3 text-slate-700 font-medium"
        >
          <Shield size={18} />
          <span className="flex-1 text-start">{t("admin.title")}</span>
          <ChevronRight size={16} className="text-slate-300" />
        </button>
      )}

      {/* Sign out */}
      <button
        onClick={() => signOut()}
        className="w-full text-center text-sm text-red-400 py-3"
      >
        {t("profile.signOut")}
      </button>

      {/* Theme modal */}
      <Modal open={showThemeModal} onClose={() => setShowThemeModal(false)} title={t("profile.theme")}>
        <div className="grid grid-cols-3 gap-3">
          {(Object.entries(themes) as [ThemeName, (typeof themes)[ThemeName]][]).map(
            ([name, theme]) => (
              <button
                key={name}
                onClick={() => switchTheme(name)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  activeTheme === name
                    ? "border-[var(--theme-start)] bg-slate-50 scale-105"
                    : "border-slate-100 hover:border-slate-200"
                }`}
              >
                <span
                  className="w-8 h-8 rounded-full"
                  style={{ background: `linear-gradient(135deg, ${theme.start}, ${theme.end})` }}
                />
                <span className="text-xs font-medium text-slate-700">{theme.label}</span>
              </button>
            ),
          )}
        </div>
      </Modal>

      {/* Eating windows modal */}
      <Modal open={showWindowsModal} onClose={() => setShowWindowsModal(false)} title={t("profile.eatingWindows")}>
        <EatingWindows onClose={() => setShowWindowsModal(false)} />
      </Modal>
    </div>
  );
}
