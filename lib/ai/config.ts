import { createAnthropic } from '@ai-sdk/anthropic';

export const AI_MODEL_IDS = {
  reasoning: 'claude-sonnet-4-5',
  parsing: 'claude-haiku-4-5',
} as const;

export const AI_TIMEOUT_MS = {
  reasoning: 30_000,
  predictLoad: 5_000,
} as const;

export class MissingAIConfigurationError extends Error {
  constructor() {
    super('ANTHROPIC_API_KEY is required for AI generation.');
    this.name = 'MissingAIConfigurationError';
  }
}

let anthropicProvider: ReturnType<typeof createAnthropic> | undefined;

export function getAnthropicProvider(): ReturnType<typeof createAnthropic> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey?.trim()) {
    throw new MissingAIConfigurationError();
  }

  anthropicProvider ??= createAnthropic({ apiKey });
  return anthropicProvider;
}
