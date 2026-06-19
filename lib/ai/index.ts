import type { AIContext, AIProvider, AIResponse } from "./types";
import { answerLocally } from "./types";
import { OpenAIProvider } from "./openai-provider";
import { ClaudeProvider } from "./claude-provider";
import { GeminiProvider } from "./gemini-provider";

export type AIProviderName = "openai" | "claude" | "gemini" | "local";

const providers: Record<AIProviderName, AIProvider> = {
  openai: new OpenAIProvider(),
  claude: new ClaudeProvider(),
  gemini: new GeminiProvider(),
  local: {
    name: "local",
    ask: async (q, ctx) => answerLocally(q, ctx),
  },
};

export function getAIProvider(name?: string): AIProvider {
  const providerName = (name ?? process.env.AI_PROVIDER ?? "local") as AIProviderName;
  return providers[providerName] ?? providers.local;
}

export async function askPetalFlow(
  question: string,
  context: AIContext,
  providerName?: string
): Promise<AIResponse> {
  const provider = getAIProvider(providerName);
  return provider.ask(question, context);
}

export { answerLocally, isPetalFlowQuestion } from "./types";
