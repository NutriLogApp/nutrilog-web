import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FlaskConical } from "lucide-react";
import { seedScenario } from "@/services/devService";

const SCENARIOS = [
  { key: "no_username", label: "No Username" },
  { key: "no_friends_no_groups", label: "No Friends/Groups" },
  { key: "has_friends_no_groups", label: "Has Friends, No Groups" },
  { key: "group_2_members", label: "Group (2 members)" },
  { key: "group_4_members", label: "Group (4 members)" },
  { key: "group_8_members", label: "Group (8 max)" },
  { key: "user_rank_1", label: "User Rank #1" },
  { key: "user_last_place", label: "User Last Place" },
  { key: "all_tied_zero", label: "All Tied Zero" },
  { key: "pending_requests", label: "Pending Requests" },
  { key: "max_friends", label: "Max Friends (20)" },
  { key: "has_friends_no_pending", label: "Friends, No Pending" },
  { key: "two_groups_max", label: "Two Groups (max)" },
  { key: "long_usernames", label: "Long Usernames" },
];

export default function DevScenarioPanel() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const queryClient = useQueryClient();

  if (!import.meta.env.DEV) return null;

  async function handleSeed(key: string) {
    setLoading(key);
    try {
      await seedScenario(key);
      await queryClient.invalidateQueries();
      setOpen(false);
    } catch (err) {
      console.error("Seed scenario failed:", err);
    } finally {
      setLoading(null);
    }
  }

  return (
    <>
      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-[998]" onClick={() => setOpen(false)} />
          <div
            className="fixed z-[999] overflow-y-auto p-2 space-y-1"
            style={{
              bottom: "calc(5rem + 56px)",
              right: "1rem",
              width: 220,
              maxHeight: "60vh",
              background: "var(--bg-elevated)",
              backdropFilter: "var(--blur)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-elevated)",
            }}
          >
            {SCENARIOS.map((s) => (
              <button
                key={s.key}
                onClick={() => handleSeed(s.key)}
                disabled={loading !== null}
                className="w-full text-start text-xs px-3 py-2 rounded-md transition-colors hover:opacity-80"
                style={{
                  color: loading === s.key ? "var(--theme-accent)" : "var(--text-secondary)",
                  background: loading === s.key ? "color-mix(in srgb, var(--theme-accent) 10%, transparent)" : "transparent",
                }}
              >
                {loading === s.key ? "Seeding..." : s.label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed z-[999] flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all active:scale-[0.93]"
        style={{
          bottom: "5rem",
          right: "1rem",
          background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))",
        }}
      >
        <FlaskConical size={20} color="white" />
      </button>
    </>
  );
}
