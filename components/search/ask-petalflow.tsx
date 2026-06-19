"use client";

import { useState } from "react";
import { Flower2, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "What did I save this week?",
  "Show forgotten petals",
  "What topics am I exploring?",
  "Summarize yesterday",
];

export function AskPetalFlow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text.trim() }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card shadow-soft">
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-petal-sage" strokeWidth={1.5} />
          <h3 className="text-[13px] font-semibold text-foreground">
            Ask PetalFlow
          </h3>
        </div>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          Questions about your saved content only
        </p>
      </div>

      <ScrollArea className="flex-1 px-5 py-4">
        {messages.length === 0 ? (
          <div className="space-y-3 py-4">
            <div className="flex justify-center">
              <Flower2 className="h-8 w-8 text-petal-sage/30" strokeWidth={1} />
            </div>
            <p className="text-center text-[12px] text-muted-foreground">
              Ask about your petals, themes, or what you saved recently.
            </p>
            <div className="space-y-1.5 pt-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="w-full rounded-lg border border-border px-3 py-2 text-left text-[12px] text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-lg px-3 py-2 text-[13px] leading-relaxed",
                  msg.role === "user"
                    ? "ml-8 bg-accent text-foreground"
                    : "mr-4 bg-muted/50 text-foreground whitespace-pre-wrap"
                )}
              >
                {msg.content}
              </div>
            ))}
            {loading && (
              <div className="mr-4 rounded-lg bg-muted/50 px-3 py-2 text-[13px] text-muted-foreground">
                Thinking...
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
        className="border-t border-border p-4"
      >
        <div className="flex gap-2">
          <Input
            placeholder="Ask about your petals..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="text-[13px]"
            disabled={loading}
          />
          <Button type="submit" size="icon" disabled={loading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
