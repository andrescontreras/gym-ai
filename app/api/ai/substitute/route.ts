import { NextResponse } from 'next/server';
import { generateExerciseSubstitution } from '@/lib/ai/service';
import { SubstitutionRequestSchema } from '@/lib/ai/schemas';
import type { SubstitutionRequest } from '@/types';

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = SubstitutionRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Cuéntanos qué cambió para encontrar una alternativa segura.', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    const { originalExercise, ...substitutionRequest } = parsed.data;
    const response = await generateExerciseSubstitution(
      originalExercise,
      substitutionRequest as SubstitutionRequest
    );

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error('Exercise substitution failed:', error);
    return NextResponse.json(
      { error: 'No pudimos encontrar alternativas ahora. Inténtalo de nuevo.', code: 'AI_SUBSTITUTION_FAILED' },
      { status: 502 }
    );
  }
}
