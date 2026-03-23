import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setUsername } from "@/services/socialService";

interface Props {
  onDone: () => void;
}

export default function UsernamePrompt({ onDone }: Props) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const qc = useQueryClient();

  const mut = useMutation({
    mutationFn: () => setUsername(value),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      onDone();
    },
    onError: () => setError("Username taken or invalid"),
  });

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-lg font-bold text-slate-900 mb-2">Set your username</h2>
      <p className="text-sm text-slate-500 mb-4">Choose a username to start using social features</p>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="username"
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-2"
      />
      {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
      <button
        onClick={() => mut.mutate()}
        disabled={!value.trim() || mut.isPending}
        className="w-full py-2.5 rounded-lg text-white font-medium text-sm disabled:opacity-50"
        style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}
      >
        Save username
      </button>
    </div>
  );
}
