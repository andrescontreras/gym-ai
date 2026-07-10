import type {
  Exercise,
  SubstitutionRequest,
  UserProfile,
  RoutineBuilderRequest,
  Goal,
  Injury,
} from '@/types';

export function buildSubstitutionPrompt(
  originalExercise: Exercise,
  request: SubstitutionRequest,
  userProfile?: UserProfile
): string {
  return `You are an expert personal trainer and biomechanics specialist. A user needs to substitute an exercise during their active workout session.

## Original Exercise
- Name: ${originalExercise.name}
- Muscle Group: ${originalExercise.muscleGroup}
- Movement Pattern: ${originalExercise.movementPattern}
- Current Load: ${request.currentWeight}kg × ${request.currentReps} reps @ RIR ${request.currentRir}

## Substitution Reason
${request.reason}

## User Context
${userProfile ? `
- Experience Level: ${userProfile.experienceLevel}
- Known Injuries: ${userProfile.injuries?.join(', ') || 'None'}
- Equipment Preferences: ${userProfile.preferences?.preferredEquipment?.join(', ') || 'None specified'}
` : 'No user profile available'}

## Task
Provide 3 biomechanically equivalent exercise alternatives that:
1. Target the same primary muscle groups
2. Match the movement pattern (or provide the closest valid alternative)
3. Account for the substitution reason
4. Maintain similar training stimulus (volume × intensity)

For each suggestion, provide:
1. Exercise name
2. Technical justification (why it's a good substitute)
3. Adjusted weight and rep recommendation to maintain RIR target
4. Confidence score (0-1) based on biomechanical equivalence

Return your response as a JSON array of suggestions.`;
}

export const SYSTEM_PROMPT = `You are an AI personal trainer integrated into a gym workout app. Your role is to provide intelligent exercise substitutions that maintain training quality while accommodating real-time constraints (equipment availability, pain/discomfort, space limitations).

Key principles:
- Prioritize safety and biomechanical soundness
- Maintain the intended training stimulus (muscle groups, movement patterns, volume)
- Account for user experience level and injury history
- Provide clear, actionable guidance with load adjustments
- Be concise but technically accurate`;

/**
 * Routine Builder Prompt
 * Generates a complete workout plan based on onboarding data
 */
export function buildRoutineBuilderPrompt(request: RoutineBuilderRequest): string {
  const { onboardingData, userProfile } = request;

  return `You are an expert strength and hypertrophy coach. Design a personalized workout plan for a user based on their profile.

## User Profile
- Experience Level: ${userProfile.experienceLevel}
- Goals: ${onboardingData.goals.map((g: Goal) => `${g.type} (${g.priority})`).join(', ')}
- Training Frequency: ${onboardingData.daysPerWeek} days/week
- Session Duration: ${onboardingData.sessionDuration} minutes
- Available Equipment: ${onboardingData.equipment.join(', ')}

## Injury History & Restrictions
${onboardingData.injuryHistory.length > 0
  ? onboardingData.injuryHistory.map((injury: Injury) =>
      `- ${injury.area} (${injury.severity}): Avoid ${injury.restrictedPatterns?.join(', ') || 'none specified'}`
    ).join('\n')
  : 'No injuries reported'}

## Task
Create a workout plan (mesocycle) that:

1. **Injury-Aware Programming**: Completely avoid restricted movement patterns. Replace dangerous exercises with safe biomechanical alternatives.

2. **Anti-Overtraining Volume**: Calculate optimal weekly volume based on experience level:
   - Beginner: 10-12 sets per muscle group per week
   - Intermediate: 12-18 sets per muscle group per week
   - Advanced: 16-22 sets per muscle group per week

3. **Intelligent Split**: Design a training split (e.g., Push/Pull/Legs, Upper/Lower, Full Body) that:
   - Guarantees 48-72 hours recovery between training the same muscle group
   - Fits the user's ${onboardingData.daysPerWeek}-day schedule
   - Maximizes training efficiency within ${onboardingData.sessionDuration} minutes

4. **Periodization**: Structure the plan in microcycles (weeks) with clear progression:
   - Accumulation phases (higher volume, moderate intensity)
   - Intensification phases (lower volume, higher intensity)
   - Strategic deload weeks

5. **Exercise Selection**: Choose exercises that:
   - Match available equipment
   - Avoid injury-restricted patterns
   - Target primary goals (hypertrophy, strength, etc.)
   - Include compound movements as foundations

Provide:
- Plan duration (8-12 weeks recommended for hypertrophy)
- Weekly microcycle breakdown with focus per week
- Day-by-day session structure (exercises, sets, reps, rest)
- Volume distribution per muscle group
- Natural language rationale explaining the programming decisions`;
}

/**
 * Voice Parsing Prompt
 * Extracts structured data from voice transcription
 */
export function buildVoiceParsingPrompt(
  transcription: string,
  exerciseContext?: string
): string {
  return `Extract workout tracking data from this voice input: "${transcription}"

${exerciseContext ? `Context: User is logging data for the exercise "${exerciseContext}"` : ''}

Extract:
- reps: Number of repetitions (e.g., "12 reps", "did 10")
- weight: Load used in kg or lb (e.g., "40 kilos", "80 pounds")
- weightUnit: 'kg' or 'lb'
- rir: Reps in Reserve (0-4), often stated as "RIR 2" or "could've done 2 more"
- rpe: Rate of Perceived Exertion (6-10), stated as "RPE 8" or "felt like an 8"

Return confidence score (0-1) based on clarity of the input.

Examples:
- "Hice 12 repeticiones con 40 kilos" → {reps: 12, weight: 40, weightUnit: 'kg', confidence: 0.95}
- "Did 10 reps at 80 pounds, RIR 2" → {reps: 10, weight: 80, weightUnit: 'lb', rir: 2, confidence: 0.98}
- "8 reps, could've done 2 more" → {reps: 8, rir: 2, confidence: 0.85}`;
}
