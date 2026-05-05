import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { type LanguageModel, generateText } from "ai";

export type AIProvider = "groq" | "google" | "openrouter";

export interface AIModelConfig {
  provider: AIProvider;
  model: string;
  maxOutputTokens: number;
  temperature: number;
}

// Провайдери
const groq = createOpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export function getLanguageModel(config: AIModelConfig): LanguageModel {
  switch (config.provider) {
    case "groq":
      return groq(config.model);
    case "openrouter":
      return openrouter(config.model);
    case "google":
      return google(config.model);
    default:
      throw new Error(`Невідомий провайдер: ${config.provider}`);
  }
}

export function getChatModel(): AIModelConfig {
  return {
    provider: "groq",
    model: "llama-3.3-70b-versatile",
    maxOutputTokens: 500,
    temperature: 0.3,
  };
}

export function getActionModel(): AIModelConfig {
  return {
    provider: "groq",
    model: "llama-3.3-70b-versatile",
    maxOutputTokens: 800,
    temperature: 0.1,
  };
}

export function getSuggestionsModel(): AIModelConfig {
  return {
    provider: "groq",
    model: "llama-3.3-70b-versatile",
    maxOutputTokens: 600,
    temperature: 0.2,
  };
}

/**
 * Залишаємо для сумісності зі старим кодом, поки не перейдемо на generateText всюди
 */
export async function callAI(
  config: AIModelConfig,
  messages: { role: string; content: string }[],
): Promise<{ text: string; usage: { inputTokens: number; outputTokens: number } | null }> {
  const model = getLanguageModel(config);

  const result = await generateText({
    model,
    messages: messages.map(m => ({
      role: m.role as "system" | "user" | "assistant",
      content: m.content,
    })),
    maxOutputTokens: config.maxOutputTokens,
    temperature: config.temperature,
  });

  return {
    text: result.text,
    usage: result.usage && result.usage.inputTokens != null && result.usage.outputTokens != null ? {
      inputTokens: result.usage.inputTokens,
      outputTokens: result.usage.outputTokens,
    } : null,
  };
}
