import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { setUsername } from "@/services/socialService";

interface Props {
  onDone: () => void;
}

export default function UsernamePrompt({ onDone }: Props) {
  const { t } = useTranslation();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const qc = useQueryClient();

  const mut = useMutation({
    mutationFn: () => setUsername(value),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["profile"] }); onDone(); },
    onError: () => setError(t("friends.usernameTaken")),
  });

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>{t("friends.setUsername")}</h2>
      <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>{t("friends.usernameHint")}</p>
      <input value={value} onChange={(e) => setValue(e.target.value)} placeholder={t("friends.username")} className="w-full border rounded-lg px-3 py-2 text-sm mb-2" style={{ borderColor: "var(--border)" }} />
      {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
      <button onClick={() => mut.mutate()} disabled={!value.trim() || mut.isPending} className="w-full py-2.5 rounded-lg text-white font-medium text-sm disabled:opacity-50" style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}>
        {t("friends.saveUsername")}
      </button>
    </div>
  );
}
