import { useLocation, useNavigate } from "react-router-dom";
import { Home, PlusCircle, BarChart3, User, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { getFriendRequests } from "@/services/socialService";

const tabs = [
  { path: "/", icon: Home, labelKey: "nav.home" },
  { path: "/log", icon: PlusCircle, labelKey: "nav.log" },
  { path: "/friends", icon: Users, labelKey: "nav.friends" },
  { path: "/trends", icon: BarChart3, labelKey: "nav.trends" },
  { path: "/profile", icon: User, labelKey: "nav.profile" },
] as const;

export default function NavBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: requests } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
    refetchInterval: 60_000,
  });
  const hasBadge = requests && requests.length > 0;

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 flex justify-around py-2 z-50">
      {tabs.map(({ path, icon: Icon, labelKey }) => {
        const active = path === "/" ? pathname === "/" : pathname.startsWith(path);
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors relative ${
              active ? "text-[var(--theme-start)]" : "text-slate-400"
            }`}
          >
            <Icon size={22} />
            {path === "/friends" && hasBadge && (
              <span className="absolute top-0 right-2 w-2 h-2 rounded-full bg-red-500" />
            )}
            <span>{t(labelKey)}</span>
          </button>
        );
      })}
    </nav>
  );
}
