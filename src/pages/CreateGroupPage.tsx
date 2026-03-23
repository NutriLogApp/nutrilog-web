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
      <button onClick={() => navigate("/friends")} className="mb-4 text-slate-500"><ArrowLeft size={20} /></button>
      <h1 className="text-xl font-bold text-slate-900 mb-4">{t("groups.newCompetition")}</h1>

      <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("groups.groupName")} maxLength={60} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-4" />

      <h2 className="text-sm font-medium text-slate-500 mb-2">{t("groups.selectFriends")}</h2>
      <div className="space-y-2 mb-4">
        {friends?.map((f: Friend) => (
          <button key={f.user_id} onClick={() => toggle(f.user_id)} className={`w-full bg-white rounded-xl p-3 shadow-sm flex items-center gap-3 border-2 transition-colors ${selected.has(f.user_id) ? "border-[var(--theme-start)]" : "border-transparent"}`}>
            <div className="w-8 h-8 rounded-full bg-slate-200" />
            <div className="text-start">
              <p className="font-medium text-slate-900">{f.name}</p>
              <p className="text-xs text-slate-400">@{f.username}</p>
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
