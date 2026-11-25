import { APICallError, generateObject, NoObjectGeneratedError } from 'ai';
import type {
  AIGenerationFallbackReason,
  AIGenerationResult,
  GenerateValidatedObjectOptions,
} from '@/types';
import { getAnthropicProvider, MissingAIConfigurationError } from './config';

export class AIGenerationUnavailableError extends Error {
  constructor(public readonly reason: AIGenerationFallbackReason) {
    super(`AI generation is unavailable (${reason}); use manual mode.`);
    this.name = 'AIGenerationUnavailableError';
  }
}

export async function generateValidatedObject<T>({
  modelId,
  schema,
  prompt,
  instructions,
  clarifiedPrompt,
  timeoutMs,
  fallback,
}: GenerateValidatedObjectOptions<T>): Promise<AIGenerationResult<T>> {
  const abortSignal = AbortSignal.timeout(timeoutMs);

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const { object } = await generateObject({
        model: getAnthropicProvider()(modelId),
        schema,
        prompt: attempt === 0 ? prompt : clarifiedPrompt,
        instructions,
        abortSignal,
        maxRetries: 0,
      });
      return { status: 'generated', object };
    } catch (error) {
      let reason: AIGenerationFallbackReason;
      if (abortSignal.aborted) {
        reason = 'timeout';
      } else if (error instanceof MissingAIConfigurationError) {
        reason = 'missing_api_key';
      } else if (APICallError.isInstance(error)) {
        reason = 'provider_error';
      } else if (NoObjectGeneratedError.isInstance(error)) {
        if (attempt === 0) {
          console.error('AI response failed validation; retrying with a clarified prompt.');
          continue;
        }
        reason = 'invalid_output';
      } else {
        throw error;
      }

      console.error(`AI generation unavailable (${reason}); using manual mode or a validated fallback.`);
      if (!fallback) {
        return { status: 'fallback_unavailable', reason };
      }

      const parsed = schema.safeParse(await fallback());
      if (!parsed.success) {
        console.error('AI fallback failed schema validation.');
        throw new Error('AI fallback failed schema validation.', { cause: parsed.error });
      }
      return { status: 'fallback', object: parsed.data, reason };
    }
  }

  throw new Error('AI generation exhausted its attempts unexpectedly.');
}

export function requireGeneratedObject<T>(result: AIGenerationResult<T>): T {
  if (result.status === 'fallback_unavailable') {
    throw new AIGenerationUnavailableError(result.reason);
  }
  return result.object;
}
