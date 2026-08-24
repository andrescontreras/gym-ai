import { createAnthropic } from '@ai-sdk/anthropic';
import { generateObject, generateText } from 'ai';
import type {
  RoutineBuilderRequest,
  RoutineBuilderResponse,
  SubstitutionRequest,
  SubstitutionResponse,
  ParsedTrackingData,
  VoiceTrackingInput,
  Exercise,
  UserProfile,
  MovementPattern,
  Injury,
} from '@/types';
import {
  buildRoutineBuilderPrompt,
  buildSubstitutionPrompt,
  buildVoiceParsingPrompt,
  SYSTEM_PROMPT,
} from './prompts';
import {
  SubstitutionResponseSchema,
  WorkoutPlanSchema,
  VoiceParsingSchema,
} from './schemas';

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

/**
 * AI Service: Routine Builder
 * Generates a personalized workout plan based on user onboarding data
 */
export async function generateWorkoutPlan(
  request: RoutineBuilderRequest
): Promise<RoutineBuilderResponse> {
  const prompt = buildRoutineBuilderPrompt(request);

  const { object: plan } = await generateObject({
    model: anthropic('claude-3-5-sonnet-20241022'),
    schema: WorkoutPlanSchema,
    prompt,
    system: SYSTEM_PROMPT,
  });

  return {
    plan: {
      id: crypto.randomUUID(),
      userId: request.userId,
      ...plan,
      goals: request.onboardingData.goals,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    aiRationale: plan.aiRationale,
    injuryConsiderations: extractInjuryConsiderations(
      request.onboardingData.injuryHistory
    ),
    progressionNotes: 'Progressive overload: Add 2.5kg or 1 rep per week when RIR ≤ 2.',
  };
}

/**
 * AI Service: Exercise Substitution
 * Provides biomechanically equivalent alternatives in real-time
 */
export async function generateExerciseSubstitution(
  originalExercise: Exercise,
  request: SubstitutionRequest,
  userProfile?: UserProfile
): Promise<SubstitutionResponse> {
  const startTime = Date.now();
  const prompt = buildSubstitutionPrompt(originalExercise, request, userProfile);

  const { object: response } = await generateObject({
    model: anthropic('claude-3-5-sonnet-20241022'),
    schema: SubstitutionResponseSchema,
    prompt,
    system: SYSTEM_PROMPT,
  });

  const validSuggestions = response.suggestions.filter(
    (suggestion) =>
      suggestion.confidenceScore >= 0.5 &&
      suggestion.exercise.movementPattern === originalExercise.movementPattern
  );

  if (validSuggestions.length === 0) {
    throw new Error('AI returned no biomechanically valid substitutions');
  }

  return {
    suggestions: validSuggestions.map((s) => ({
      ...s,
      exercise: {
        id: crypto.randomUUID(),
        ...s.exercise,
        synergistMuscles: originalExercise.synergistMuscles,
        movementPattern: s.exercise.movementPattern as MovementPattern,
      },
    })),
    originalExercise,
    processingTime: Date.now() - startTime,
  };
}

/**
 * AI Service: Voice Input Parser
 * Extracts structured tracking data from natural language voice input
 */
export async function parseVoiceTrackingInput(
  input: VoiceTrackingInput
): Promise<ParsedTrackingData> {
  const transcription = input.transcription || '';
  const prompt = buildVoiceParsingPrompt(transcription, input.exerciseContext);

  const { object: parsed } = await generateObject({
    model: anthropic('claude-3-5-haiku-20241022'), // Use Haiku for speed
    schema: VoiceParsingSchema,
    prompt,
    system:
      'You are a voice input parser for a gym tracking app. Extract reps, weight, and effort metrics from natural language.',
  });

  return {
    ...parsed,
    rawInput: transcription,
  };
}

/**
 * AI Service: Predictive Load Calculation
 * Suggests next session's weight and reps based on historical performance
 */
export async function predictNextLoad(
  exerciseId: string,
  recentHistory: Array<{ weight: number; reps: number; rir: number; date: string }>
): Promise<{ suggestedWeight: number; suggestedReps: number; rationale: string }> {
  const prompt = `Based on this recent performance history for an exercise:
${recentHistory.map((h) => `- ${h.date}: ${h.weight}kg × ${h.reps} @ RIR ${h.rir}`).join('\n')}

Recommend the weight and reps for the next session to ensure progressive overload.
Consider:
- If last RIR was ≤2, increase load
- If last RIR was ≥4, maintain or reduce load
- Standard progression: +2.5kg for upper body, +5kg for lower body
- Rep progression: +1-2 reps if maintaining weight

Provide a brief rationale.`;

  const { text } = await generateText({
    model: anthropic('claude-3-5-haiku-20241022'),
    prompt,
    system: 'You are an expert strength coach providing progressive overload recommendations.',
  });

  // Parse the response (simplified - in production, use structured output)
  const weightMatch = text.match(/(\d+(?:\.\d+)?)\s*kg/i);
  const repsMatch = text.match(/(\d+)\s*reps?/i);

  return {
    suggestedWeight: weightMatch ? parseFloat(weightMatch[1]) : recentHistory[0].weight,
    suggestedReps: repsMatch ? parseInt(repsMatch[1]) : recentHistory[0].reps,
    rationale: text,
  };
}

// Helper Functions
function extractInjuryConsiderations(injuries: Injury[]): string[] {
  return injuries.map((injury) => {
    const restrictedPatterns = injury.restrictedPatterns?.join(', ') || 'none';
    return `${injury.area} (${injury.severity}): Avoid ${restrictedPatterns}`;
  });
}
