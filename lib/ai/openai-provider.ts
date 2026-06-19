import type { AIContext, AIProvider, AIResponse } from "./types";
import { answerLocally, buildContextSummary, isPetalFlowQuestion } from "./types";

const OFF_TOPIC = "I can only help with content saved in PetalFlow.";

export class OpenAIProvider implements AIProvider {
  name = "openai";

  async ask(question: string, context: AIContext): Promise<AIResponse> {
    if (!isPetalFlowQuestion(question)) {
      return { answer: OFF_TOPIC };
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return answerLocally(question, context);

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are Ask PetalFlow, an assistant that ONLY answers questions about the user's saved content (petals). Use this data:\n\n${buildContextSummary(context)}\n\nIf the question is unrelated to their saved content, respond exactly: "${OFF_TOPIC}"`,
            },
            { role: "user", content: question },
          ],
          max_tokens: 500,
          temperature: 0.3,
        }),
      });

      if (!res.ok) return answerLocally(question, context);

      const data = await res.json();
      return { answer: data.choices[0].message.content };
    } catch {
      return answerLocally(question, context);
    }
  }
}
