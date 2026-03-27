import { useState, useRef, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { searchUser, sendFriendRequest, suggestUsers, type Friend } from "@/services/socialService";
import Modal from "@/components/Modal";

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSearch?: string;
}

export default function AddFriendModal({ isOpen, onClose, initialSearch }: AddFriendModalProps) {
  const { t } = useTranslation();
  const qc = useQueryClient();

  const [friendSearch, setFriendSearch] = useState("");
  const [friendResult, setFriendResult] = useState<Friend | null | undefined>(undefined);
  const [friendSent, setFriendSent] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const appliedInitialRef = useRef(false);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) setShowSuggestions(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Pre-fill search when modal opens with initialSearch (deep link flow)
  useEffect(() => {
    if (isOpen && initialSearch && !appliedInitialRef.current) {
      appliedInitialRef.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: seeds input before async search
      setFriendSearch(initialSearch);
      searchUser(initialSearch.trim()).then(setFriendResult);
    }
    if (!isOpen) {
      appliedInitialRef.current = false;
    }
  }, [isOpen, initialSearch]);

  const handleSearchChange = useCallback((value: string) => {
    setFriendSearch(value);
    setFriendResult(undefined);
    setFriendSent(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length >= 2) {
      debounceRef.current = setTimeout(() => {
        suggestUsers(value).then((r) => { setSuggestions(r); setShowSuggestions(r.length > 0); }).catch(() => setSuggestions([]));
      }, 300);
    } else { setSuggestions([]); setShowSuggestions(false); }
  }, []);

  const handleClose = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setFriendResult(undefined);
    setFriendSent(false);
    setFriendSearch("");
    setSuggestions([]);
    setShowSuggestions(false);
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={handleClose} title={t("profile.addFriend")}>
      <div className="space-y-3">
        <div className="relative">
          <div className="flex gap-2">
            <input value={friendSearch} onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && friendSearch.trim()) { setShowSuggestions(false); searchUser(friendSearch.trim()).then(setFriendResult); } }}
              placeholder={t("friends.searchPlaceholder")}
              className="flex-1 rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            <button onClick={() => { setShowSuggestions(false); searchUser(friendSearch.trim()).then(setFriendResult); }} disabled={!friendSearch.trim()}
              className="px-4 py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-50 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}><Search size={16} /></button>
          </div>
          {showSuggestions && suggestions.length > 0 && (
            <div ref={suggestionsRef} className="absolute left-0 right-12 mt-1 rounded-xl overflow-hidden shadow-lg z-10"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
              {suggestions.map((u) => (
                <button key={u} onClick={() => { setFriendSearch(u); setSuggestions([]); setShowSuggestions(false); searchUser(u).then(setFriendResult); }}
                  className="w-full text-start px-4 py-2.5 text-sm font-medium" style={{ color: "var(--text-primary)", borderBottom: "1px solid var(--border)" }}>@{u}</button>
              ))}
            </div>
          )}
        </div>
        {friendResult === null && <p className="text-sm text-center py-2" style={{ color: "var(--text-muted)" }}>{t("friends.noUserFound")}</p>}
        {friendResult && (
          <div className="glass-card-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full" style={{ backgroundColor: "var(--bg-input)" }} />
            <div className="flex-1">
              <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{friendResult.name}</p>
              {friendResult.username && <p className="text-xs" style={{ color: "var(--text-muted)" }}>@{friendResult.username}</p>}
            </div>
            {friendSent ? (
              <span className="text-xs font-semibold" style={{ color: "var(--theme-accent)" }}>{t("friends.sent")}</span>
            ) : (
              <button onClick={() => sendFriendRequest(friendSearch.trim()).then(() => { setFriendSent(true); qc.invalidateQueries({ queryKey: ["friends"] }); })}
                className="px-4 py-1.5 rounded-lg text-white text-xs font-semibold active:scale-[0.95]"
                style={{ background: "var(--theme-accent)" }}>{t("friends.add")}</button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
