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
    <div className="p-4 max-w-lg mx-auto">
      <button onClick={() => navigate("/friends")} className="mb-4" style={{ color: "var(--text-muted)" }}><ArrowLeft size={20} /></button>
      <h1 className="text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>{t("friends.addFriend")}</h1>

      <div className="flex gap-2 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder={t("friends.searchPlaceholder")}
          className="flex-1 border rounded-lg px-3 py-2 text-sm"
          style={{ borderColor: "var(--border)" }}
        />
        <button onClick={handleSearch} disabled={searching} className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}>
          {searching ? <Loader2 size={16} className="animate-spin" /> : t("friends.search")}
        </button>
      </div>

      {result === null && <p className="text-sm text-center py-4" style={{ color: "var(--text-muted)" }}>{t("friends.noUserFound")}</p>}

      {result && (
        <div className="rounded-xl p-4 shadow-sm flex items-center gap-3" style={{ backgroundColor: "var(--bg-card)" }}>
          <div className="w-10 h-10 rounded-full" style={{ backgroundColor: "var(--bg-input)" }} />
          <div className="flex-1">
            <p className="font-medium" style={{ color: "var(--text-primary)" }}>{result.name}</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>@{result.username}</p>
          </div>
          {sent ? (
            <span className="text-xs text-emerald-500 font-medium">{t("friends.sent")}</span>
          ) : (
            <button onClick={() => sendMut.mutate()} disabled={sendMut.isPending} className="text-xs px-4 py-1.5 rounded-lg text-white" style={{ background: "var(--theme-start)" }}>
              {t("friends.add")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
