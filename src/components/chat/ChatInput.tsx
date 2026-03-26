import { useRef, useCallback } from "react";
import { ArrowUp, Square } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}

export default function ChatInput({
  value,
  onChange,
  onSend,
  onStop,
  isStreaming,
  disabled,
}: ChatInputProps) {
  const { t } = useTranslation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isStreaming && value.trim()) {
        onSend();
      }
    }
  };

  const canSend = value.trim().length > 0 && !isStreaming && !disabled;

  return (
    <div
      className="flex items-end gap-2 px-3 py-2 rounded-full"
      style={{
        background: "var(--bg-input)",
        border: "1px solid var(--border)",
      }}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          autoResize();
        }}
        onKeyDown={handleKeyDown}
        placeholder={t("chat.placeholder")}
        maxLength={500}
        rows={1}
        disabled={isStreaming || disabled}
        className="flex-1 bg-transparent resize-none outline-none text-sm leading-snug py-1"
        style={{
          color: "var(--text-primary)",
          maxHeight: "120px",
        }}
      />

      {isStreaming ? (
        <button
          onClick={onStop}
          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all"
          style={{
            background:
              "linear-gradient(135deg, var(--theme-start), var(--theme-end))",
          }}
        >
          <Square size={14} color="#fff" fill="#fff" />
        </button>
      ) : (
        <button
          onClick={onSend}
          disabled={!canSend}
          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all"
          style={{
            background: canSend
              ? "linear-gradient(135deg, var(--theme-start), var(--theme-end))"
              : "var(--bg-elevated)",
            opacity: canSend ? 1 : 0.5,
          }}
        >
          <ArrowUp size={16} color={canSend ? "#fff" : "var(--text-muted)"} />
        </button>
      )}
    </div>
  );
}
