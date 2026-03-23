import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";
import { getProfile } from "@/services/profileService";
import { listUsers, updateUserStatus } from "@/services/adminService";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  suspended: "bg-red-100 text-red-700",
};

export default function AdminPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  const { data: users, isLoading } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: listUsers,
  });

  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateUserStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminUsers"] }),
  });

  if (!profileLoading && profile?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  if (isLoading || profileLoading) {
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
      <h1 className="text-xl font-bold text-slate-900 mb-4">{t("admin.title")}</h1>

      <div className="space-y-2">
        {users?.map((user) => (
          <div
            key={user.id}
            className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 truncate">{user.name}</p>
              <p className="text-xs text-slate-400">{user.email}</p>
              <span
                className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[user.status] ?? ""}`}
              >
                {t(`admin.${user.status}`)}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              {user.status !== "active" && (
                <button
                  onClick={() =>
                    statusMut.mutate({ id: user.id, status: "active" })
                  }
                  className="text-xs px-3 py-1 rounded-lg bg-emerald-500 text-white"
                >
                  {t("admin.approve")}
                </button>
              )}
              {user.status !== "suspended" && (
                <button
                  onClick={() =>
                    statusMut.mutate({ id: user.id, status: "suspended" })
                  }
                  className="text-xs px-3 py-1 rounded-lg bg-red-500 text-white"
                >
                  {t("admin.suspend")}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
