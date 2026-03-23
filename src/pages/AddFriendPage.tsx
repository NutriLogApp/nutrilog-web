import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Loader2 } from "lucide-react";
import { searchUser, sendFriendRequest, type Friend } from "@/services/socialService";

export default function AddFriendPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Friend | null | undefined>(undefined);
  const [searching, setSearching] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSearch() {
    if (!query.trim()) return;
    setSearching(true);
    setResult(undefined);
    const r = await searchUser(query.trim());
    setResult(r);
    setSearching(false);
  }

  const sendMut = useMutation({
    mutationFn: () => sendFriendRequest(query.trim()),
    onSuccess: () => setSent(true),
  });

  return (
    <div className="px-5 pt-6 pb-4 max-w-lg mx-auto space-y-5">
      <button onClick={() => navigate("/friends")} className="mb-0" style={{ color: "var(--text-muted)" }}><ArrowLeft size={20} /></button>
      <h1 className="text-xl font-bold tracking-tight animate-fade-up" style={{ color: "var(--text-primary)" }}>{t("friends.addFriend")}</h1>

      <div className="flex gap-2 animate-fade-up">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder={t("friends.searchPlaceholder")}
          className="flex-1 border rounded-lg px-3 py-2 text-sm"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-input)", color: "var(--text-primary)" }}
        />
        <button onClick={handleSearch} disabled={searching} className="px-4 py-2 rounded-lg text-white text-sm font-medium active:scale-[0.98] transition-transform" style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}>
          {searching ? <Loader2 size={16} className="animate-spin" /> : t("friends.search")}
        </button>
      </div>

      {result === null && <p className="text-sm text-center py-4" style={{ color: "var(--text-muted)" }}>{t("friends.noUserFound")}</p>}

      {result && (
        <div className="glass-card p-4 flex items-center gap-3 animate-fade-up">
          <div className="w-10 h-10 rounded-full" style={{ backgroundColor: "var(--bg-input)" }} />
          <div className="flex-1">
            <p className="font-medium" style={{ color: "var(--text-primary)" }}>{result.name}</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>@{result.username}</p>
          </div>
          {sent ? (
            <span className="text-xs text-emerald-500 font-medium">{t("friends.sent")}</span>
          ) : (
            <button onClick={() => sendMut.mutate()} disabled={sendMut.isPending} className="text-xs px-4 py-1.5 rounded-lg text-white active:scale-[0.98] transition-transform" style={{ background: "var(--theme-accent)" }}>
              {t("friends.add")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
