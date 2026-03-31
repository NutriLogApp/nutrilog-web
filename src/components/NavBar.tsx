import { useLocation, useNavigate } from "react-router-dom";
import { Home, BarChart3, User, Trophy, MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

const tabs = [
  { path: "/", icon: Home, labelKey: "nav.home" },
  { path: "/chat", icon: MessageCircle, labelKey: "nav.chat" },
  { path: "/contest", icon: Trophy, labelKey: "nav.contest" },
  { path: "/trends", icon: BarChart3, labelKey: "nav.trends" },
  { path: "/profile", icon: User, labelKey: "nav.profile" },
] as const;

export default function NavBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 pointer-events-none">
      <nav
        className="max-w-lg mx-auto flex justify-around py-3 pointer-events-auto"
        style={{
          background: "var(--bg-elevated)",
          backdropFilter: "var(--blur)",
          WebkitBackdropFilter: "var(--blur)",
          borderTop: "1px solid var(--border)",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.1)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {tabs.map(({ path, icon: Icon, labelKey }) => {
          const active = path === "/"
            ? pathname === "/"
            : path === "/profile"
              ? pathname.startsWith("/profile") || pathname === "/settings"
              : pathname.startsWith(path);
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-1 px-3 py-1.5 text-[10px] font-medium transition-all duration-200 relative"
              style={{
                color: active ? "var(--theme-accent)" : "var(--text-muted)",
                transform: active ? "scale(1.08)" : "scale(1)",
              }}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span>{t(labelKey)}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
