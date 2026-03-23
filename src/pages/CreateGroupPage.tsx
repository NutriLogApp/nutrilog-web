import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Loader2 } from "lucide-react";
import { listFriends, createGroup, type Friend } from "@/services/socialService";

export default function CreateGroupPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { data: friends } = useQuery({ queryKey: ["friends"], queryFn: listFriends });

  const mut = useMutation({
    mutationFn: () => createGroup(name, [...selected]),
    onSuccess: () => navigate("/friends"),
  });

  function toggle(id: string) {
    setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }

  return (
    <div className="px-5 pt-6 pb-4 max-w-lg mx-auto space-y-5">
      <button onClick={() => navigate("/friends")} className="mb-0" style={{ color: "var(--text-muted)" }}><ArrowLeft size={20} /></button>
      <h1 className="text-xl font-bold tracking-tight animate-fade-up" style={{ color: "var(--text-primary)" }}>{t("groups.newCompetition")}</h1>

      <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("groups.groupName")} maxLength={60}
        className="w-full border rounded-lg px-3 py-2 text-sm animate-fade-up"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-input)", color: "var(--text-primary)" }} />

      <div className="animate-fade-up">
        <h2 className="text-sm font-medium mb-2" style={{ color: "var(--text-muted)" }}>{t("groups.selectFriends")}</h2>
        <div className="space-y-2">
          {friends?.map((f: Friend) => (
            <button key={f.user_id} onClick={() => toggle(f.user_id)} className={`glass-card-sm w-full p-3 flex items-center gap-3 border-2 transition-colors active:scale-[0.98] ${selected.has(f.user_id) ? "border-[var(--theme-accent)]" : "border-transparent"}`}>
              <div className="w-8 h-8 rounded-full" style={{ backgroundColor: "var(--bg-input)" }} />
              <div className="text-start">
                <p className="font-medium" style={{ color: "var(--text-primary)" }}>{f.name}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>@{f.username}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <button onClick={() => mut.mutate()} disabled={!name.trim() || selected.size === 0 || mut.isPending} className="w-full py-3 rounded-lg text-white font-medium disabled:opacity-50 active:scale-[0.98] transition-transform animate-fade-up" style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}>
        {mut.isPending ? <Loader2 size={16} className="animate-spin mx-auto" /> : t("groups.create")}
      </button>
    </div>
  );
}
