import type { Petal } from "@/lib/types";

export interface AIContext {
  petals: Petal[];
  userName: string;
}

export interface AIResponse {
  answer: string;
  sources?: string[];
}

export interface AIProvider {
  name: string;
  ask(question: string, context: AIContext): Promise<AIResponse>;
}

const OFF_TOPIC_RESPONSE =
  "I can only help with content saved in PetalFlow.";

export function isPetalFlowQuestion(question: string): boolean {
  const keywords = [
    "petal",
    "saved",
    "save",
    "watch",
    "forgotten",
    "week",
    "yesterday",
    "today",
    "topic",
    "theme",
    "collection",
    "garden",
    "inbox",
    "unread",
    "unviewed",
    "summarize",
    "summary",
    "exploring",
    "content",
    "article",
    "video",
    "bookmark",
    "timeline",
    "recent",
    "show me",
    "what did i",
    "how many",
  ];
  const lower = question.toLowerCase();
  return keywords.some((k) => lower.includes(k));
}

export function buildContextSummary(context: AIContext): string {
  const { petals, userName } = context;
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const thisWeek = petals.filter((p) => new Date(p.created_at) >= weekAgo);
  const yesterdayPetals = petals.filter((p) => {
    const d = new Date(p.created_at);
    return d >= yesterday && d < todayStart;
  });
  const todayPetals = petals.filter((p) => new Date(p.created_at) >= todayStart);
  const forgotten = petals.filter((p) => !p.viewed);

  const themeCounts: Record<string, number> = {};
  petals.forEach((p) => {
    if (p.theme) themeCounts[p.theme] = (themeCounts[p.theme] ?? 0) + 1;
  });

  const topThemes = Object.entries(themeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([t, c]) => `${t} (${c})`)
    .join(", ");

  return `User: ${userName}
Total petals: ${petals.length}
Saved today: ${todayPetals.length} — ${todayPetals.map((p) => p.title).join("; ") || "none"}
Saved yesterday: ${yesterdayPetals.length} — ${yesterdayPetals.map((p) => p.title).join("; ") || "none"}
Saved this week: ${thisWeek.length}
Unviewed/forgotten: ${forgotten.length} — ${forgotten.slice(0, 5).map((p) => p.title).join("; ")}
Top themes: ${topThemes || "none yet"}
Recent petals: ${petals.slice(0, 10).map((p) => `[${p.platform}] ${p.title} (${p.theme ?? "untagged"})`).join("\n")}`;
}

export function answerLocally(question: string, context: AIContext): AIResponse {
  if (!isPetalFlowQuestion(question)) {
    return { answer: OFF_TOPIC_RESPONSE };
  }

  const q = question.toLowerCase();
  const { petals } = context;
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  if (q.includes("this week") || q.includes("saved this week")) {
    const week = petals.filter((p) => new Date(p.created_at) >= weekAgo);
    if (week.length === 0) {
      return { answer: "You haven't saved any petals this week yet." };
    }
    const list = week.map((p) => `• ${p.title} (${p.theme ?? p.platform})`).join("\n");
    return {
      answer: `You saved ${week.length} petal${week.length > 1 ? "s" : ""} this week:\n\n${list}`,
      sources: week.map((p) => p.id),
    };
  }

  if (q.includes("forgotten") || q.includes("unviewed") || q.includes("unread")) {
    const forgotten = petals.filter((p) => !p.viewed);
    if (forgotten.length === 0) {
      return { answer: "You're all caught up — no forgotten petals!" };
    }
    const list = forgotten
      .slice(0, 8)
      .map((p) => `• ${p.title}`)
      .join("\n");
    return {
      answer: `You have ${forgotten.length} unviewed petal${forgotten.length > 1 ? "s" : ""}:\n\n${list}`,
      sources: forgotten.map((p) => p.id),
    };
  }

  if (q.includes("yesterday")) {
    const yesterdayPetals = petals.filter((p) => {
      const d = new Date(p.created_at);
      return d >= yesterday && d < todayStart;
    });
    if (yesterdayPetals.length === 0) {
      return { answer: "You didn't save anything yesterday." };
    }
    const list = yesterdayPetals.map((p) => `• ${p.title}`).join("\n");
    return {
      answer: `Yesterday you saved ${yesterdayPetals.length} petal${yesterdayPetals.length > 1 ? "s" : ""}:\n\n${list}`,
      sources: yesterdayPetals.map((p) => p.id),
    };
  }

  if (q.includes("topic") || q.includes("exploring") || q.includes("theme")) {
    const themeCounts: Record<string, number> = {};
    petals.forEach((p) => {
      if (p.theme) themeCounts[p.theme] = (themeCounts[p.theme] ?? 0) + 1;
    });
    const sorted = Object.entries(themeCounts).sort((a, b) => b[1] - a[1]);
    if (sorted.length === 0) {
      return { answer: "You haven't tagged any themes yet. Try adding themes when saving petals." };
    }
    const list = sorted.map(([t, c]) => `• ${t}: ${c} petal${c > 1 ? "s" : ""}`).join("\n");
    return { answer: `Here's what you're exploring:\n\n${list}` };
  }

  if (q.includes("today")) {
    const today = petals.filter((p) => new Date(p.created_at) >= todayStart);
    if (today.length === 0) {
      return { answer: "No petals saved today yet. Ready to capture something?" };
    }
    const list = today.map((p) => `• ${p.title}`).join("\n");
    return {
      answer: `Today you've saved ${today.length} petal${today.length > 1 ? "s" : ""}:\n\n${list}`,
      sources: today.map((p) => p.id),
    };
  }

  if (q.includes("summarize") || q.includes("summary")) {
    const recent = petals.slice(0, 5);
    const themes = [...new Set(recent.map((p) => p.theme).filter(Boolean))];
    return {
      answer: `Your recent saves span ${themes.join(", ") || "various topics"}. You've saved ${petals.filter((p) => !p.viewed).length} unviewed items waiting for you.`,
    };
  }

  return {
    answer: `You have ${petals.length} petals total, with ${petals.filter((p) => !p.viewed).length} still unviewed. Ask me about what you saved this week, forgotten petals, or your exploring topics.`,
  };
}
