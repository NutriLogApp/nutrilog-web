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
    <div className="p-4 max-w-lg mx-auto">
      <button onClick={() => navigate("/friends")} className="mb-4" style={{ color: "var(--text-muted)" }}><ArrowLeft size={20} /></button>
      <h1 className="text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>{t("groups.newCompetition")}</h1>

      <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("groups.groupName")} maxLength={60} className="w-full border rounded-lg px-3 py-2 text-sm mb-4" style={{ borderColor: "var(--border)" }} />

      <h2 className="text-sm font-medium mb-2" style={{ color: "var(--text-muted)" }}>{t("groups.selectFriends")}</h2>
      <div className="space-y-2 mb-4">
        {friends?.map((f: Friend) => (
          <button key={f.user_id} onClick={() => toggle(f.user_id)} className={`w-full rounded-xl p-3 shadow-sm flex items-center gap-3 border-2 transition-colors ${selected.has(f.user_id) ? "border-[var(--theme-start)]" : "border-transparent"}`} style={{ backgroundColor: "var(--bg-card)" }}>
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: "var(--bg-input)" }} />
            <div className="text-start">
              <p className="font-medium" style={{ color: "var(--text-primary)" }}>{f.name}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>@{f.username}</p>
            </div>
          </button>
        ))}
      </div>

      <button onClick={() => mut.mutate()} disabled={!name.trim() || selected.size === 0 || mut.isPending} className="w-full py-3 rounded-lg text-white font-medium disabled:opacity-50" style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}>
        {mut.isPending ? <Loader2 size={16} className="animate-spin mx-auto" /> : t("groups.create")}
      </button>
    </div>
  );
}
