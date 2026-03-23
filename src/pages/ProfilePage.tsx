import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";
import { getProfile, updateProfile } from "@/services/profileService";
import { useAuth } from "@/hooks/useAuth";
import { themes, applyTheme, type ThemeName } from "@/themes/themes";
import { useState, useEffect } from "react";

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

  useEffect(() => {
    if (profile) {
      setGoals({
        daily_cal_goal: profile.daily_cal_goal ?? 2000,
        daily_protein_goal_g: profile.daily_protein_goal_g ?? 120,
        daily_fat_goal_g: profile.daily_fat_goal_g ?? 78,
        daily_carbs_goal_g: profile.daily_carbs_goal_g ?? 180,
      });
    }
  }, [profile]);

  function saveGoals() {
    updateMut.mutate(goals);
  }

  function switchLanguage(lang: string) {
    i18n.changeLanguage(lang);
    updateMut.mutate({ language: lang });
  }

  function switchTheme(name: ThemeName) {
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

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-slate-900 mb-4">{t("profile.title")}</h1>

      {/* User info */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-4 flex items-center gap-3">
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt=""
            className="w-12 h-12 rounded-full"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-slate-200" />
        )}
        <div>
          <p className="font-medium text-slate-900">{profile?.name}</p>
          <p className="text-xs text-slate-400">{profile?.email}</p>
        </div>
      </div>

      {/* Goals */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
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
              <label className="text-xs text-slate-400">
                {label} ({unit})
              </label>
              <input
                type="number"
                value={goals[key]}
                onChange={(e) =>
                  setGoals((g) => ({ ...g, [key]: +e.target.value || 0 }))
                }
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mt-1"
              />
            </div>
          ))}
        </div>
        <button
          onClick={saveGoals}
          disabled={updateMut.isPending}
          className="w-full mt-3 py-2 rounded-lg text-white text-sm font-medium"
          style={{
            background:
              "linear-gradient(135deg, var(--theme-start), var(--theme-end))",
          }}
        >
          {t("profile.save")}
        </button>
      </div>

      {/* Theme picker */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <h2 className="font-semibold text-slate-700 mb-3">{t("profile.theme")}</h2>
        <div className="grid grid-cols-3 gap-2">
          {(Object.entries(themes) as [ThemeName, (typeof themes)[ThemeName]][]).map(
            ([name, theme]) => {
              const active =
                (profile?.theme ?? "ocean") === name;
              return (
                <button
                  key={name}
                  onClick={() => switchTheme(name)}
                  className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium border transition-colors ${
                    active
                      ? "border-slate-900 bg-slate-50"
                      : "border-slate-100"
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded-full shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${theme.start}, ${theme.end})`,
                    }}
                  />
                  {theme.label}
                </button>
              );
            },
          )}
        </div>
      </div>

      {/* Language */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <h2 className="font-semibold text-slate-700 mb-3">{t("profile.language")}</h2>
        <div className="flex gap-2">
          {[
            { code: "en", label: "English" },
            { code: "he", label: "עברית" },
          ].map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchLanguage(lang.code)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                i18n.language === lang.code
                  ? "border-slate-900 bg-slate-50"
                  : "border-slate-100"
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
          className="w-full bg-white rounded-xl p-4 shadow-sm mb-4 flex items-center gap-3 text-slate-700 font-medium"
        >
          <Shield size={18} />
          {t("admin.title")}
        </button>
      )}

      {/* Sign out */}
      <button
        onClick={() => signOut()}
        className="w-full text-center text-sm text-slate-400 underline mt-4"
      >
        {t("profile.signOut")}
      </button>
    </div>
  );
}
