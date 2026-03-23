import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getCollection, type CatInfo } from "@/services/petService";

const LS_KEY = "nutrilog_pet_last_seen_unlock";

export default function UnlockNotification() {
  const { t } = useTranslation();
  const [newCat, setNewCat] = useState<CatInfo | null>(null);
  const { data } = useQuery({ queryKey: ["petCollection"], queryFn: getCollection });

  useEffect(() => {
    if (!data) return;
    const lastSeen = localStorage.getItem(LS_KEY);
    if (lastSeen === null) {
      const newest = data.cats
        .filter((c) => c.unlocked && c.unlocked_at)
        .sort((a, b) => (b.unlocked_at ?? "").localeCompare(a.unlocked_at ?? ""))[0];
      if (newest?.unlocked_at) localStorage.setItem(LS_KEY, newest.unlocked_at);
      return;
    }
    const unseen = data.cats.filter((c) => c.unlocked && c.unlocked_at && c.unlocked_at > lastSeen);
    if (unseen.length > 0) setNewCat(unseen[unseen.length - 1]);
  }, [data]);

  function dismiss() {
    if (newCat?.unlocked_at) localStorage.setItem(LS_KEY, newCat.unlocked_at);
    setNewCat(null);
  }

  if (!newCat) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30">
      <button onClick={dismiss} className="w-full max-w-lg bg-white rounded-t-2xl p-6 text-center shadow-xl">
        <span className="text-5xl block mb-3">{newCat.emoji}</span>
        <p className="text-lg font-bold text-slate-900">{t("pet.unlocked", { name: newCat.name })}</p>
        <p className="text-sm text-slate-400 mt-1">{t("pet.tapDismiss")}</p>
      </button>
    </div>
  );
}
