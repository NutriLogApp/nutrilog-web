import { useLocation, useNavigate } from "react-router-dom";
import { Home, PlusCircle, BarChart3, User } from "lucide-react";
import { useTranslation } from "react-i18next";

const tabs = [
  { path: "/", icon: Home, labelKey: "dashboard.greeting" },
  { path: "/log", icon: PlusCircle, labelKey: "log.title" },
  { path: "/trends", icon: BarChart3, labelKey: "trends.title" },
  { path: "/profile", icon: User, labelKey: "profile.title" },
] as const;

export default function NavBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 flex justify-around py-2 z-50">
      {tabs.map(({ path, icon: Icon, labelKey }) => {
        const active = path === "/" ? pathname === "/" : pathname.startsWith(path);
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors ${
              active ? "text-[var(--theme-start)]" : "text-slate-400"
            }`}
          >
            <Icon size={22} />
            <span>{t(labelKey).split(" ")[0]}</span>
          </button>
        );
      })}
    </nav>
  );
}
