import { Bot } from "lucide-react";
import type { FoodSuggestion } from "@/services/chatService";
import LogMealButton from "./LogMealButton";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  foods?: FoodSuggestion[];
  userInitial?: string;
}

function stripFoodsComment(text: string): string {
  return text.replace(/<!--FOODS:.*?-->/gs, "").trim();
}

export default function ChatMessage({
  role,
  content,
  isStreaming,
  foods,
  userInitial = "?",
}: ChatMessageProps) {
  const displayContent = stripFoodsComment(content);

  return (
    <div className="flex gap-2.5 w-full">
      {/* Avatar */}
      {role === "assistant" ? (
        <div
          className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5"
          style={{
            background:
              "linear-gradient(135deg, var(--theme-start), var(--theme-end))",
          }}
        >
          <Bot size={16} color="#fff" strokeWidth={2} />
        </div>
      ) : (
        <div
          className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 text-xs font-semibold"
          style={{
            background: "var(--bg-input)",
            color: "var(--text-primary)",
          }}
        >
          {userInitial.toUpperCase()}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div
          className="text-sm leading-relaxed whitespace-pre-wrap break-words"
          style={{ color: "var(--text-primary)" }}
        >
          {displayContent}
          {isStreaming && (
            <span
              className="inline-block w-0.5 h-4 ml-0.5 align-middle animate-pulse"
              style={{ background: "var(--theme-accent)" }}
            />
          )}
        </div>

        {foods && foods.length > 0 && !isStreaming && (
          <LogMealButton foods={foods} />
        )}
      </div>
    </div>
  );
}
