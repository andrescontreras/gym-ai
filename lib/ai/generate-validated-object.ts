import {
  APICallError,
  generateObject,
  NoObjectGeneratedError,
} from 'ai';
import type {
  AIGenerationFallbackReason,
  AIGenerationResult,
  GenerateValidatedObjectOptions,
} from '@/types';
import type { ZodType } from 'zod';
import {
  getAnthropicProvider,
  MissingAIConfigurationError,
} from './config';

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

  try {
    const { object } = await generateObject({
      model: getAnthropicProvider()(modelId),
      schema,
      prompt,
      instructions,
      abortSignal,
      maxRetries: 0,
    });

    return { status: 'generated', object };
  } catch (error) {
    if (error instanceof MissingAIConfigurationError) {
      return buildFallback(schema, fallback, 'missing_api_key');
    }

    if (isTimeoutError(error)) {
      console.error('AI request timed out; using the validated fallback.');
      return buildFallback(schema, fallback, 'timeout');
    }

    if (APICallError.isInstance(error)) {
      console.error('AI request failed; using the validated fallback.');
      return buildFallback(schema, fallback, 'provider_error');
    }

    if (!NoObjectGeneratedError.isInstance(error)) {
      throw error;
    }
  }

  console.error('AI response failed schema validation; retrying once.');

  try {
    const { object } = await generateObject({
      model: getAnthropicProvider()(modelId),
      schema,
      prompt: clarifiedPrompt,
      instructions,
      abortSignal,
      maxRetries: 0,
    });

    return { status: 'generated', object };
  } catch (error) {
    if (error instanceof MissingAIConfigurationError) {
      return buildFallback(schema, fallback, 'missing_api_key');
    }

    if (isTimeoutError(error)) {
      console.error('AI retry timed out; using the validated fallback.');
      return buildFallback(schema, fallback, 'timeout');
    }

    if (APICallError.isInstance(error)) {
      console.error('AI retry failed; using the validated fallback.');
      return buildFallback(schema, fallback, 'provider_error');
    }

    if (NoObjectGeneratedError.isInstance(error)) {
      console.error('AI retry failed schema validation; using the validated fallback.');
      return buildFallback(schema, fallback, 'invalid_output');
    }

    throw error;
  }
}

async function buildFallback<T>(
  schema: ZodType<T>,
  fallback: (() => T | Promise<T>) | undefined,
  reason: AIGenerationFallbackReason
): Promise<AIGenerationResult<T>> {
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

function isTimeoutError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'TimeoutError';
}
