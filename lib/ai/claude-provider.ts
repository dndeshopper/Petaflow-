import type { AIContext, AIProvider, AIResponse } from "./types";
import { answerLocally, buildContextSummary, isPetalFlowQuestion } from "./types";

const OFF_TOPIC = "I can only help with content saved in PetalFlow.";

export class ClaudeProvider implements AIProvider {
  name = "claude";

  async ask(question: string, context: AIContext): Promise<AIResponse> {
    if (!isPetalFlowQuestion(question)) {
      return { answer: OFF_TOPIC };
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return answerLocally(question, context);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 500,
          system: `You are Ask PetalFlow. Only answer about saved content:\n\n${buildContextSummary(context)}\n\nIf unrelated, say: "${OFF_TOPIC}"`,
          messages: [{ role: "user", content: question }],
        }),
      });

      if (!res.ok) return answerLocally(question, context);

      const data = await res.json();
      return { answer: data.content[0].text };
    } catch {
      return answerLocally(question, context);
    }
  }
}
