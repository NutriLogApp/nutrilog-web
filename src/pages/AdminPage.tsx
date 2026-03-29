import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";
import { getProfile } from "@/services/profileService";
import { listUsers, updateUserStatus } from "@/services/adminService";
import {
  getAdminAnnouncements,
  createAnnouncement,
  updateAnnouncement,
} from "@/services/announcementService";

export default function AdminPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();

  const { data: profile, isLoading: profileLoading } = useQuery({ queryKey: ["profile"], queryFn: getProfile });
  const { data: users, isLoading } = useQuery({ queryKey: ["adminUsers"], queryFn: listUsers });

  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateUserStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminUsers"] }),
  });

  const { data: announcements } = useQuery({
    queryKey: ["adminAnnouncements"],
    queryFn: getAdminAnnouncements,
  });

  const createAnnMut = useMutation({
    mutationFn: createAnnouncement,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminAnnouncements"] });
      setAnnTitle("");
      setAnnBody("");
    },
  });

  const toggleAnnMut = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      updateAnnouncement(id, { active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminAnnouncements"] }),
  });

  const [annTitle, setAnnTitle] = useState("");
  const [annBody, setAnnBody] = useState("");

  if (!profileLoading && profile?.role !== "admin") return <Navigate to="/" replace />;

  if (isLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--border)", borderTopColor: "var(--theme-accent)" }} />
      </div>
    );
  }

  return (
    <div className="px-5 pt-8 pb-8">
      <h1 className="text-[26px] font-bold tracking-tight mb-6 animate-fade-up" style={{ color: "var(--text-primary)" }}>{t("admin.title")}</h1>

      <div className="space-y-3 animate-fade-up stagger-1">
        {users?.map((user) => (
          <div key={user.id} className="glass-card p-4 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>{user.name}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{user.email}</p>
              <span className="inline-block mt-1.5 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
                style={{
                  backgroundColor: user.status === "active" ? "rgba(16,185,129,0.12)" : user.status === "pending" ? "rgba(245,158,11,0.12)" : "rgba(239,68,68,0.12)",
                  color: user.status === "active" ? "#10b981" : user.status === "pending" ? "#f59e0b" : "#ef4444",
                }}>
                {t(`admin.${user.status}`)}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {user.status !== "active" && (
                <button onClick={() => statusMut.mutate({ id: user.id, status: "active" })}
                  className="text-xs font-semibold px-4 py-2.5 rounded-xl text-white transition-all active:scale-[0.97]"
                  style={{ backgroundColor: "#10b981", minHeight: 44 }}>
                  {t("admin.approve")}
                </button>
              )}
              {user.status !== "suspended" && (
                <button onClick={() => statusMut.mutate({ id: user.id, status: "suspended" })}
                  className="text-xs font-semibold px-4 py-2.5 rounded-xl text-white transition-all active:scale-[0.97]"
                  style={{ backgroundColor: "#ef4444", minHeight: 44 }}>
                  {t("admin.suspend")}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Announcements Section */}
      <div className="mt-8 animate-fade-up stagger-2">
        <h2 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>
          {t("admin.announcements")}
        </h2>

        {/* Create form */}
        <div className="glass-card p-4 mb-4">
          <input
            type="text"
            value={annTitle}
            onChange={(e) => setAnnTitle(e.target.value)}
            placeholder={t("admin.announcementTitle")}
            className="w-full rounded-xl px-4 py-3 text-sm font-medium mb-2"
            style={{
              background: "var(--bg-input)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
            }}
          />
          <textarea
            value={annBody}
            onChange={(e) => setAnnBody(e.target.value)}
            placeholder={t("admin.announcementBody")}
            rows={2}
            className="w-full rounded-xl px-4 py-3 text-sm font-medium mb-3"
            style={{
              background: "var(--bg-input)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
              resize: "vertical",
            }}
          />
          <button
            onClick={() => {
              if (annTitle.trim()) {
                createAnnMut.mutate({
                  title: annTitle.trim(),
                  body: annBody.trim() || undefined,
                });
              }
            }}
            disabled={!annTitle.trim() || createAnnMut.isPending}
            className="text-xs font-semibold px-5 py-2.5 rounded-xl text-white transition-all active:scale-[0.97] disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))",
              minHeight: 44,
            }}
          >
            {t("admin.send")}
          </button>
        </div>

        {/* Announcement list */}
        <div className="space-y-3">
          {announcements?.map((ann) => (
            <div key={ann.id} className="glass-card p-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
                  {ann.title}
                </p>
                {ann.body && (
                  <p className="text-xs mt-1 line-clamp-2" style={{ color: "var(--text-muted)" }}>
                    {ann.body}
                  </p>
                )}
                <span
                  className="inline-block mt-1.5 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
                  style={{
                    backgroundColor: ann.active ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                    color: ann.active ? "#10b981" : "#ef4444",
                  }}
                >
                  {t(ann.active ? "admin.active" : "admin.inactive")}
                </span>
              </div>
              <button
                onClick={() => toggleAnnMut.mutate({ id: ann.id, active: !ann.active })}
                className="text-xs font-semibold px-4 py-2.5 rounded-xl text-white transition-all active:scale-[0.97]"
                style={{ backgroundColor: ann.active ? "#ef4444" : "#10b981", minHeight: 44 }}
              >
                {t(ann.active ? "admin.suspend" : "admin.approve")}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
