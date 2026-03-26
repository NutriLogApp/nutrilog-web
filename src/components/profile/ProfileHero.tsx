import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings, User } from "lucide-react";
import { updateProfile } from "@/services/profileService";
import { setUsername as setUsernameApi } from "@/services/socialService";
import type { ProfileOut } from "@/types/api";

interface Props {
  profile: ProfileOut;
}

export default function ProfileHero({ profile }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [editingName, setEditingName] = useState(false);
  const [editName, setEditName] = useState("");
  const [editingUsername, setEditingUsername] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);

  const updateMut = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });

  return (
    <div
      className="relative px-5 pt-10 pb-4 text-center"
      style={{
        background: `linear-gradient(135deg, color-mix(in srgb, var(--theme-start) 14%, transparent), color-mix(in srgb, var(--theme-end) 8%, transparent))`,
      }}
    >
      {/* Gear icon */}
      <button
        onClick={() => navigate("/settings")}
        className="absolute top-10 end-5 w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
      >
        <Settings size={20} style={{ color: "var(--text-muted)" }} />
      </button>

      {/* Avatar with gradient ring */}
      <div
        className="w-[86px] h-[86px] rounded-full mx-auto p-[3px]"
        style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}
      >
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt=""
            className="w-20 h-20 rounded-full"
            style={{ border: "3px solid var(--bg-page)" }}
          />
        ) : (
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "var(--bg-input)", border: "3px solid var(--bg-page)" }}
          >
            <User size={32} style={{ color: "var(--text-muted)" }} />
          </div>
        )}
      </div>

      {/* Name */}
      {editingName ? (
        <input
          ref={nameRef}
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
          onBlur={() => {
            if (editName.trim() && editName !== profile.name) {
              updateMut.mutate({ name: editName.trim() });
            }
            setEditingName(false);
          }}
          className="mt-3 text-lg font-bold w-full bg-transparent outline-none border-b-2 text-center"
          style={{ color: "var(--text-primary)", borderColor: "var(--theme-accent)" }}
        />
      ) : (
        <p
          className="mt-3 text-lg font-bold cursor-pointer hover:opacity-70 transition-opacity"
          style={{ color: "var(--text-primary)" }}
          onClick={() => {
            setEditName(profile.name ?? "");
            setEditingName(true);
            setTimeout(() => nameRef.current?.focus(), 0);
          }}
        >
          {profile.name}
        </p>
      )}

      {/* Username */}
      {editingUsername ? (
        <div>
          <input
            ref={usernameRef}
            value={editUsername}
            onChange={(e) => { setEditUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, "")); setUsernameError(null); }}
            onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
            onBlur={() => {
              const val = editUsername.trim();
              if (!val || val === profile.username) { setEditingUsername(false); return; }
              if (val.length < 3 || val.length > 30) { setUsernameError(t("friends.usernameInvalid")); return; }
              setUsernameApi(val)
                .then(() => { qc.invalidateQueries({ queryKey: ["profile"] }); setEditingUsername(false); setUsernameError(null); })
                .catch(() => setUsernameError(t("friends.usernameTaken")));
            }}
            className="mt-0.5 text-[13px] font-medium w-full bg-transparent outline-none border-b-2 text-center"
            style={{ color: "var(--theme-accent)", borderColor: "var(--theme-accent)" }}
          />
          {usernameError && <p className="text-[10px] mt-0.5 text-red-500">{usernameError}</p>}
        </div>
      ) : (
        <p
          className="mt-0.5 text-[13px] font-medium cursor-pointer hover:opacity-70 transition-opacity"
          style={{ color: "var(--theme-accent)" }}
          onClick={() => {
            setEditUsername(profile.username ?? "");
            setEditingUsername(true);
            setUsernameError(null);
            setTimeout(() => usernameRef.current?.focus(), 0);
          }}
        >
          {profile.username ? `@${profile.username}` : `@${t("friends.username")}`}
        </p>
      )}
    </div>
  );
}
