import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Shield, Palette, Clock, Target, Coffee, RefreshCw, Globe, Timer, Settings, UserCog, Users, UserPlus, Share2, Copy, Scale, Search } from "lucide-react";
import { getProfile, updateProfile } from "@/services/profileService";
import { useAuth } from "@/hooks/useAuth";
import { themes, applyTheme, type ThemeName } from "@/themes/themes";
import { useState, useEffect } from "react";
import { logWeight, getWeightHistory } from "@/services/weightService";
import { searchUser, sendFriendRequest } from "@/services/socialService";
import EatingWindows from "@/components/EatingWindows";
import DrinkManager from "@/components/DrinkManager";
import OnboardingQuiz from "@/components/OnboardingQuiz";
import Modal from "@/components/Modal";

function Chevron({ lang }: { lang: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      style={{ color: "var(--text-muted)", transform: lang === "he" ? "scaleX(-1)" : undefined }}>
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}

function SettingRow({ icon: Icon, label, onClick, extra, lang, isFirst }: {
  icon: React.ElementType; label: string; onClick: () => void; extra?: React.ReactNode; lang: string; isFirst?: boolean;
}) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 p-4 active:scale-[0.98] transition-transform"
      style={{ borderTop: isFirst ? undefined : `1px solid var(--border)` }}>
      <Icon size={18} style={{ color: "var(--theme-accent)" }} />
      <span className="flex-1 text-start text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{label}</span>
      {extra}
      <Chevron lang={lang} />
    </button>
  );
}

function SectionHeader({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-2 px-1">
      <Icon size={14} style={{ color: "var(--text-muted)" }} />
      <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>{label}</h2>
    </div>
  );
}

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: profile, isLoading } = useQuery({ queryKey: ["profile"], queryFn: getProfile });
  const updateMut = useMutation({ mutationFn: updateProfile, onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }) });
  const { data: weightHistory } = useQuery({ queryKey: ["weightHistory"], queryFn: getWeightHistory });

  const [goals, setGoals] = useState({ daily_cal_goal: 2000, daily_protein_goal_g: 120, daily_fat_goal_g: 78, daily_carbs_goal_g: 180, daily_water_goal_ml: 2000 });
  const [modal, setModal] = useState<string | null>(null);
  const [activeTheme, setActiveTheme] = useState<ThemeName>("ocean");
  const [darkMode, setDarkMode] = useState<"auto" | "light" | "dark">("auto");
  const [weightInput, setWeightInput] = useState("");
  const [publicName, setPublicName] = useState("");
  const [friendSearch, setFriendSearch] = useState("");
  const [friendResult, setFriendResult] = useState<{ user_id: string; name: string; username: string | null } | null | undefined>(undefined);
  const [friendSent, setFriendSent] = useState(false);

  useEffect(() => {
    if (profile) {
      setGoals({ daily_cal_goal: profile.daily_cal_goal ?? 2000, daily_protein_goal_g: profile.daily_protein_goal_g ?? 120, daily_fat_goal_g: profile.daily_fat_goal_g ?? 78, daily_carbs_goal_g: profile.daily_carbs_goal_g ?? 180, daily_water_goal_ml: profile.daily_water_goal_ml ?? 2000 });
      setActiveTheme((profile.theme ?? "ocean") as ThemeName);
      setPublicName(profile.username ?? "");
    }
    const saved = localStorage.getItem("nutrilog-dark-mode");
    if (saved) setDarkMode(saved as "auto" | "light" | "dark");
  }, [profile]);

  function saveGoals() { updateMut.mutate(goals); setModal(null); }
  function switchLanguage(lang: string) { i18n.changeLanguage(lang); document.documentElement.dir = lang === "he" ? "rtl" : "ltr"; updateMut.mutate({ language: lang }); }
  function switchTheme(name: ThemeName) { setActiveTheme(name); applyTheme(name); localStorage.setItem("nutrilog-theme", name); updateMut.mutate({ theme: name }); }
  function switchDarkMode(mode: "auto" | "light" | "dark") {
    setDarkMode(mode); localStorage.setItem("nutrilog-dark-mode", mode);
    const root = document.documentElement; root.classList.remove("force-dark", "force-light");
    if (mode === "dark") root.classList.add("force-dark");
    else if (mode === "light") root.classList.add("force-light");
  }

  const logWeightMut = useMutation({
    mutationFn: () => logWeight(parseFloat(weightInput)),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["weightHistory"] }); setWeightInput(""); setModal(null); },
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--border)", borderTopColor: "var(--theme-accent)" }} />
    </div>
  );

  const lang = i18n.language;
  const currentTheme = themes[activeTheme];
  const latestWeight = weightHistory?.[weightHistory.length - 1];

  return (
    <div className="px-5 pt-8 pb-8 max-w-lg mx-auto space-y-5">
      <h1 className="text-[26px] font-bold tracking-tight animate-fade-up" style={{ color: "var(--text-primary)" }}>{t("profile.title")}</h1>

      {/* User card */}
      <div className="glass-card p-4 flex items-center gap-3 animate-fade-up stagger-1">
        {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-14 h-14 rounded-full" /> : <div className="w-14 h-14 rounded-full" style={{ backgroundColor: "var(--bg-input)" }} />}
        <div className="flex-1 min-w-0">
          <p className="font-bold truncate" style={{ color: "var(--text-primary)" }}>{profile?.name}</p>
          <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{profile?.email}</p>
          {profile?.username && <p className="text-xs mt-0.5 font-medium" style={{ color: "var(--theme-accent)" }}>@{profile.username}</p>}
        </div>
      </div>

      {/* 1. Personal Settings */}
      <div className="animate-fade-up stagger-2">
        <SectionHeader icon={UserCog} label={t("profile.personalSettings")} />
        <div className="glass-card overflow-hidden">
          <SettingRow icon={Target} label={t("profile.goals")} onClick={() => setModal("goals")} lang={lang} isFirst />
          <SettingRow icon={Coffee} label={t("profile.customDrinks")} onClick={() => setModal("drinks")} lang={lang} />
          <SettingRow icon={Scale} label={t("weight.title")} onClick={() => setModal("weight")} lang={lang}
            extra={latestWeight && <span className="text-xs font-medium tabular-nums" style={{ color: "var(--text-muted)" }}>{latestWeight.weight_kg}kg</span>} />
          <SettingRow icon={Clock} label={t("profile.eatingWindows")} onClick={() => setModal("windows")} lang={lang} />
          <SettingRow icon={RefreshCw} label={t("profile.retakeQuiz")} onClick={() => setModal("quiz")} lang={lang} />
        </div>
      </div>

      {/* 2. Social */}
      <div className="animate-fade-up stagger-3">
        <SectionHeader icon={Users} label={t("profile.social")} />
        <div className="glass-card overflow-hidden">
          <SettingRow icon={UserPlus} label={t("profile.publicName")} onClick={() => setModal("publicName")} lang={lang} isFirst
            extra={profile?.username && <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>@{profile.username}</span>} />
          <SettingRow icon={Search} label={t("profile.addFriend")} onClick={() => setModal("addFriend")} lang={lang} />
          <SettingRow icon={Share2} label={t("profile.shareInvite")} onClick={() => setModal("share")} lang={lang} />
        </div>
      </div>

      {/* 3. App Settings */}
      <div className="animate-fade-up stagger-4">
        <SectionHeader icon={Settings} label={t("profile.appSettings")} />
        <div className="glass-card overflow-hidden">
          <SettingRow icon={Palette} label={t("profile.appearance")} onClick={() => setModal("appearance")} lang={lang} isFirst
            extra={<span className="w-6 h-6 rounded-full shrink-0" style={{ background: `linear-gradient(135deg, ${currentTheme.start}, ${currentTheme.end})` }} />} />
          <SettingRow icon={Globe} label={t("profile.language")} onClick={() => setModal("language")} lang={lang}
            extra={<span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{lang === "he" ? "עברית" : "English"}</span>} />
          <SettingRow icon={Timer} label={t("profile.timeFormat")} onClick={() => setModal("timeFormat")} lang={lang}
            extra={<span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{profile?.use_24h ? "24h" : "12h"}</span>} />
        </div>
      </div>

      {/* Admin */}
      {profile?.role === "admin" && (
        <div className="animate-fade-up stagger-5">
          <div className="glass-card overflow-hidden">
            <SettingRow icon={Shield} label={t("admin.title")} onClick={() => navigate("/admin")} lang={lang} isFirst />
          </div>
        </div>
      )}

      <button onClick={() => signOut()} className="w-full text-center text-sm py-3 font-medium text-red-400">{t("profile.signOut")}</button>

      {/* ===== Modals ===== */}

      {/* Goals */}
      <Modal open={modal === "goals"} onClose={() => setModal(null)} title={t("profile.goals")}>
        <div className="space-y-3">
          {([
            ["daily_cal_goal", t("profile.calories"), t("dashboard.kcal")],
            ["daily_protein_goal_g", t("macros.protein"), t("log.g")],
            ["daily_fat_goal_g", t("macros.fat"), t("log.g")],
            ["daily_carbs_goal_g", t("macros.carbs"), t("log.g")],
            ["daily_water_goal_ml", t("water.title"), t("water.ml")],
          ] as const).map(([key, label, unit]) => (
            <div key={key}>
              <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{label} ({unit})</label>
              <input type="number" value={goals[key]} onChange={(e) => setGoals((g) => ({ ...g, [key]: +e.target.value || 0 }))}
                className="w-full rounded-xl px-4 py-3 text-sm mt-1" style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            </div>
          ))}
          <button onClick={saveGoals} disabled={updateMut.isPending} className="w-full py-3 rounded-xl text-white text-sm font-semibold active:scale-[0.98] transition-transform"
            style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}>{t("profile.save")}</button>
        </div>
      </Modal>

      {/* Drinks */}
      <Modal open={modal === "drinks"} onClose={() => setModal(null)} title={t("profile.customDrinks")}>
        <DrinkManager />
      </Modal>

      {/* Weight */}
      <Modal open={modal === "weight"} onClose={() => setModal(null)} title={t("weight.title")}>
        <div className="space-y-4">
          <div className="flex gap-2">
            <input type="number" step="0.1" value={weightInput} onChange={(e) => setWeightInput(e.target.value)}
              placeholder={t("weight.placeholder")} className="flex-1 rounded-xl px-4 py-3 text-sm"
              style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            <button onClick={() => logWeightMut.mutate()} disabled={!weightInput || logWeightMut.isPending}
              className="px-6 py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-50 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}>
              {t("weight.log")}
            </button>
          </div>
          {weightHistory && weightHistory.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>{t("weight.recent")}</h3>
              {weightHistory.slice(-5).reverse().map((w) => (
                <div key={w.date} className="flex justify-between text-sm" style={{ color: "var(--text-secondary)" }}>
                  <span>{w.date}</span>
                  <span className="font-semibold tabular-nums">{w.weight_kg} kg</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Eating Windows */}
      <Modal open={modal === "windows"} onClose={() => setModal(null)} title={t("profile.eatingWindows")}>
        <EatingWindows onClose={() => setModal(null)} />
      </Modal>

      {/* Public Name */}
      <Modal open={modal === "publicName"} onClose={() => setModal(null)} title={t("profile.publicName")}>
        <div className="space-y-3">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>{t("profile.publicNameDesc")}</p>
          <input value={publicName} onChange={(e) => setPublicName(e.target.value)} placeholder={t("friends.username")}
            className="w-full rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
          <button onClick={() => {
            import("@/services/socialService").then(({ setUsername }) => {
              setUsername(publicName).then(() => { qc.invalidateQueries({ queryKey: ["profile"] }); setModal(null); });
            });
          }} disabled={!publicName.trim()}
            className="w-full py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-50 active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}>
            {t("profile.save")}
          </button>
        </div>
      </Modal>

      {/* Add Friend (popup) */}
      <Modal open={modal === "addFriend"} onClose={() => { setModal(null); setFriendResult(undefined); setFriendSent(false); setFriendSearch(""); }} title={t("profile.addFriend")}>
        <div className="space-y-3">
          <div className="flex gap-2">
            <input value={friendSearch} onChange={(e) => setFriendSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && friendSearch.trim() && searchUser(friendSearch.trim()).then(setFriendResult)}
              placeholder={t("friends.searchPlaceholder")}
              className="flex-1 rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            <button onClick={() => searchUser(friendSearch.trim()).then(setFriendResult)} disabled={!friendSearch.trim()}
              className="px-4 py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-50 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}>
              <Search size={16} />
            </button>
          </div>
          {friendResult === null && <p className="text-sm text-center py-2" style={{ color: "var(--text-muted)" }}>{t("friends.noUserFound")}</p>}
          {friendResult && (
            <div className="glass-card-sm p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full" style={{ backgroundColor: "var(--bg-input)" }} />
              <div className="flex-1">
                <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{friendResult.name}</p>
                {friendResult.username && <p className="text-xs" style={{ color: "var(--text-muted)" }}>@{friendResult.username}</p>}
              </div>
              {friendSent ? (
                <span className="text-xs font-semibold" style={{ color: "var(--theme-accent)" }}>{t("friends.sent")}</span>
              ) : (
                <button onClick={() => sendFriendRequest(friendSearch.trim()).then(() => setFriendSent(true))}
                  className="px-4 py-1.5 rounded-lg text-white text-xs font-semibold active:scale-[0.95]"
                  style={{ background: "var(--theme-accent)" }}>{t("friends.add")}</button>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* Share Invite */}
      <Modal open={modal === "share"} onClose={() => setModal(null)} title={t("profile.shareInvite")}>
        <div className="space-y-4">
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{t("profile.shareDesc")}</p>
          {profile?.friend_code && (
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-xl px-4 py-3 text-sm font-mono tabular-nums" style={{ backgroundColor: "var(--bg-input)", color: "var(--text-primary)" }}>
                {profile.friend_code}
              </div>
              <button onClick={() => navigator.clipboard.writeText(profile.friend_code ?? "")}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90"
                style={{ backgroundColor: "var(--bg-input)", color: "var(--theme-accent)" }}>
                <Copy size={16} />
              </button>
            </div>
          )}
          <button onClick={() => {
            const url = `${window.location.origin}/friends/add?code=${profile?.friend_code}`;
            if (navigator.share) navigator.share({ title: "NutriLog", text: t("profile.shareText"), url });
            else navigator.clipboard.writeText(url);
          }}
            className="w-full py-3 rounded-xl text-white font-semibold transition-all active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}>
            {t("profile.shareLink")}
          </button>
        </div>
      </Modal>

      {/* Appearance */}
      <Modal open={modal === "appearance"} onClose={() => setModal(null)} title={t("profile.appearance")}>
        <h3 className="text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>{t("profile.darkMode")}</h3>
        <div className="flex gap-2 mb-5">
          {(["auto", "light", "dark"] as const).map((mode) => (
            <button key={mode} onClick={() => switchDarkMode(mode)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all"
              style={{ borderColor: darkMode === mode ? "var(--theme-accent)" : "var(--border)", backgroundColor: darkMode === mode ? "var(--bg-input)" : "transparent", color: "var(--text-primary)" }}>
              {t(`profile.${mode}`)}
            </button>
          ))}
        </div>
        <h3 className="text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>{t("profile.colorTheme")}</h3>
        <div className="grid grid-cols-3 gap-3">
          {(Object.entries(themes) as [ThemeName, (typeof themes)[ThemeName]][]).map(([name, theme]) => (
            <button key={name} onClick={() => switchTheme(name)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all"
              style={{ borderColor: activeTheme === name ? "var(--theme-accent)" : "var(--border)", backgroundColor: activeTheme === name ? "var(--bg-input)" : "transparent", transform: activeTheme === name ? "scale(1.05)" : undefined }}>
              <span className="w-8 h-8 rounded-full" style={{ background: `linear-gradient(135deg, ${theme.start}, ${theme.end})` }} />
              <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{theme.label}</span>
            </button>
          ))}
        </div>
      </Modal>

      {/* Language */}
      <Modal open={modal === "language"} onClose={() => setModal(null)} title={t("profile.language")}>
        <div className="flex gap-3">
          {[{ code: "en", label: "English" }, { code: "he", label: "עברית" }].map((l) => (
            <button key={l.code} onClick={() => { switchLanguage(l.code); setModal(null); }}
              className="flex-1 py-4 rounded-xl text-base font-semibold border-2 transition-all active:scale-[0.97]"
              style={{ borderColor: lang === l.code ? "var(--theme-accent)" : "var(--border)", backgroundColor: lang === l.code ? "var(--bg-input)" : "transparent", color: "var(--text-primary)" }}>
              {l.label}
            </button>
          ))}
        </div>
      </Modal>

      {/* Time Format */}
      <Modal open={modal === "timeFormat"} onClose={() => setModal(null)} title={t("profile.timeFormat")}>
        <h3 className="text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>{t("profile.clockFormat")}</h3>
        <div className="flex gap-3 mb-4">
          {[{ val: true, label: "24h", example: "14:30" }, { val: false, label: "12h", example: "2:30 PM" }].map((opt) => (
            <button key={String(opt.val)} onClick={() => { updateMut.mutate({ use_24h: opt.val }); }}
              className="flex-1 py-3 rounded-xl border-2 transition-all active:scale-[0.97] flex flex-col items-center gap-1"
              style={{ borderColor: (profile?.use_24h ?? true) === opt.val ? "var(--theme-accent)" : "var(--border)", backgroundColor: (profile?.use_24h ?? true) === opt.val ? "var(--bg-input)" : "transparent" }}>
              <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{opt.label}</span>
              <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{opt.example}</span>
            </button>
          ))}
        </div>
        <h3 className="text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>{t("profile.weekStart")}</h3>
        <div className="flex gap-3">
          {[{ val: 0, label: t("profile.sunday") }, { val: 1, label: t("profile.monday") }].map((opt) => (
            <button key={opt.val} onClick={() => { updateMut.mutate({ first_day_of_week: opt.val }); }}
              className="flex-1 py-3 rounded-xl border-2 transition-all active:scale-[0.97]"
              style={{ borderColor: (profile?.first_day_of_week ?? 0) === opt.val ? "var(--theme-accent)" : "var(--border)", backgroundColor: (profile?.first_day_of_week ?? 0) === opt.val ? "var(--bg-input)" : "transparent", color: "var(--text-primary)" }}>
              <span className="text-sm font-semibold">{opt.label}</span>
            </button>
          ))}
        </div>
      </Modal>

      {/* Retake Quiz */}
      {modal === "quiz" && (
        <div className="fixed inset-0" style={{ zIndex: 70, backgroundColor: "var(--bg-page)" }}>
          <OnboardingQuiz onDone={() => { setModal(null); qc.invalidateQueries({ queryKey: ["profile"] }); }} />
        </div>
      )}
    </div>
  );
}
