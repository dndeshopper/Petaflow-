import type { AIContext, AIProvider, AIResponse } from "./types";
import { answerLocally, buildContextSummary, isPetalFlowQuestion } from "./types";

const OFF_TOPIC = "I can only help with content saved in PetalFlow.";

export class GeminiProvider implements AIProvider {
  name = "gemini";

  async ask(question: string, context: AIContext): Promise<AIResponse> {
    if (!isPetalFlowQuestion(question)) {
      return { answer: OFF_TOPIC };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return answerLocally(question, context);

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are Ask PetalFlow. Only answer about saved content:\n\n${buildContextSummary(context)}\n\nIf unrelated, say: "${OFF_TOPIC}"\n\nQuestion: ${question}`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!res.ok) return answerLocally(question, context);

      const data = await res.json();
      return { answer: data.candidates[0].content.parts[0].text };
    } catch {
      return answerLocally(question, context);
    }
  }
}
