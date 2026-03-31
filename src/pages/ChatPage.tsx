import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Bot, RotateCcw } from "lucide-react";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatInput from "@/components/chat/ChatInput";
import {
  streamChat,
  type ChatMessage as ChatMsg,
  type FoodSuggestion,
} from "@/services/chatService";
import { getProfile } from "@/services/profileService";

interface DisplayMessage {
  role: "user" | "assistant";
  content: string;
  foods?: FoodSuggestion[];
}

export default function ChatPage() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [streamingFoods, setStreamingFoods] = useState<FoodSuggestion[]>([]);
  const [showThinking, setShowThinking] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  const userInitial = profile?.name?.[0] ?? profile?.email?.[0] ?? "?";

  // Auto-scroll on new content
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent, showThinking]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    setInput("");
    const userMsg: DisplayMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);
    setStreamingContent("");
    setStreamingFoods([]);
    setShowThinking(true);

    const history: ChatMsg[] = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const controller = new AbortController();
    abortRef.current = controller;

    let fullContent = "";
    let foods: FoodSuggestion[] = [];

    try {
      for await (const event of streamChat(text, history, controller.signal)) {
        if (event.type === "token") {
          setShowThinking(false);
          fullContent += event.token;
          setStreamingContent(fullContent);
        } else if (event.type === "foods") {
          foods = event.foods;
          setStreamingFoods(event.foods);
        } else if (event.type === "error") {
          setShowThinking(false);
          fullContent += event.error;
          setStreamingContent(fullContent);
        } else if (event.type === "done") {
          break;
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        fullContent = fullContent || t("chat.welcome");
      }
    }

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: fullContent,
        foods: foods.length > 0 ? foods : undefined,
      },
    ]);
    setIsStreaming(false);
    setStreamingContent("");
    setStreamingFoods([]);
    setShowThinking(false);
    abortRef.current = null;
  }, [input, isStreaming, messages, t]);

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const handleNewChat = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setIsStreaming(false);
    setStreamingContent("");
    setStreamingFoods([]);
    setShowThinking(false);
    setInput("");
  }, []);

  return (
    <div
      className="flex flex-col"
      style={{ height: "calc(100lvh - 96px - env(safe-area-inset-bottom, 0px) - env(safe-area-inset-top, 0px))" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 shrink-0"
        style={{
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{
            background:
              "linear-gradient(135deg, var(--theme-start), var(--theme-end))",
          }}
        >
          <Bot size={20} color="#fff" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            NutriBot
          </div>
          <div
            className="text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            {t("chat.subtitle")}
          </div>
        </div>
        <button
          onClick={handleNewChat}
          className="p-2 rounded-full transition-all active:scale-95"
          style={{ color: "var(--text-muted)" }}
          title={t("chat.newChat")}
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Welcome message (always first) */}
        <ChatMessage
          role="assistant"
          content={t("chat.welcome")}
          userInitial={userInitial}
        />

        {messages.map((msg, i) => (
          <ChatMessage
            key={i}
            role={msg.role}
            content={msg.content}
            foods={msg.foods}
            userInitial={userInitial}
          />
        ))}

        {/* Thinking indicator */}
        {showThinking && (
          <div className="flex gap-2.5 w-full">
            <div
              className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5"
              style={{
                background:
                  "linear-gradient(135deg, var(--theme-start), var(--theme-end))",
              }}
            >
              <Bot size={16} color="#fff" strokeWidth={2} />
            </div>
            <div
              className="text-sm flex items-center gap-1 py-1"
              style={{ color: "var(--text-muted)" }}
            >
              <span className="animate-bounce" style={{ animationDelay: "0ms" }}>●</span>
              <span className="animate-bounce" style={{ animationDelay: "150ms" }}>●</span>
              <span className="animate-bounce" style={{ animationDelay: "300ms" }}>●</span>
            </div>
          </div>
        )}

        {/* Streaming message */}
        {isStreaming && streamingContent && (
          <ChatMessage
            role="assistant"
            content={streamingContent}
            isStreaming
            foods={streamingFoods.length > 0 ? streamingFoods : undefined}
            userInitial={userInitial}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div
        className="shrink-0 px-4 pt-2 pb-3"
        style={{
          paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
          borderTop: "1px solid var(--border)",
        }}
      >
        <ChatInput
          value={input}
          onChange={setInput}
          onSend={handleSend}
          onStop={handleStop}
          isStreaming={isStreaming}
        />
        <div
          className="text-[10px] text-center mt-1.5"
          style={{ color: "var(--text-muted)" }}
        >
          {t("chat.hint")}
        </div>
      </div>
    </div>
  );
}
