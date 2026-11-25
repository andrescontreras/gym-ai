import type { ZodType } from 'zod';

// Shared types
export type AIGenerationFallbackReason =
  | 'missing_api_key'
  | 'provider_error'
  | 'timeout'
  | 'invalid_output';

export type AIGenerationResult<T> =
  | { status: 'generated'; object: T }
  | { status: 'fallback'; object: T; reason: AIGenerationFallbackReason }
  | { status: 'fallback_unavailable'; reason: AIGenerationFallbackReason };

export interface GenerateValidatedObjectOptions<T> {
  modelId: string;
  schema: ZodType<T>;
  prompt: string;
  instructions: string;
  clarifiedPrompt: string;
  timeoutMs: number;
  fallback?: () => T | Promise<T>;
}

// Catalog types (Dev C)
export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  synergistMuscles?: string[]; // Secondary muscles activated
  movementPattern: 'push_horizontal' | 'push_vertical' | 'pull_horizontal' | 'pull_vertical' | 'squat' | 'hinge' | 'lunge' | 'carry';
  equipment: string[];
  resistanceProfile?: ResistanceProfile;
  description?: string;
  videoUrl?: string;
  embedding?: number[]; // pgvector for semantic search
  biomechanicalTags?: string[]; // E.g., 'unilateral', 'compound', 'isolation'
}

export type ResistanceProfile = 'constant' | 'ascending' | 'descending' | 'accommodating';

// Proposed vocabularies (S0-C3); values live in lib/constants.ts.
export type EquipmentAccessory = 'bench' | 'rack' | 'pull_up_bar' | 'landmine' | 'box' | 'trap_bar';

export type CatalogEquipment = EquipmentType | EquipmentAccessory;

export type InjuryZone =
  | 'neck'
  | 'shoulder'
  | 'elbow'
  | 'wrist'
  | 'lower_back'
  | 'hip'
  | 'knee'
  | 'ankle';

export interface CandidateExerciseFilters {
  movementPatterns?: MovementPattern[];
  excludedPatterns?: MovementPattern[];
  // An exercise matches only if every item it requires is in this list.
  availableEquipment?: CatalogEquipment[];
  muscleGroup?: string;
}

export type EquipmentType =
  | 'full_gym'
  | 'dumbbells'
  | 'barbell'
  | 'kettlebells'
  | 'resistance_bands'
  | 'bodyweight'
  | 'machines'
  | 'cables';

export type MovementPattern =
  | 'push_horizontal'
  | 'push_vertical'
  | 'pull_horizontal'
  | 'pull_vertical'
  | 'squat'
  | 'hinge'
  | 'lunge'
  | 'carry';

// Session and tracking types (Dev A)
export interface WorkoutSession {
  id: string;
  userId: string;
  date: string;
  name: string;
  exercises: SessionExercise[];
  status: 'planned' | 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface SessionExercise {
  id: string;
  exerciseId: string;
  exercise: Exercise;
  sets: number;
  reps: number;
  weight: number;
  rir: number; // Reps in Reserve (0-4)
  rpe?: number; // Rate of Perceived Exertion (6-10)
  restSeconds: number;
  notes?: string;
  completed: boolean;
  substitutedFrom?: string; // Original exercise ID if this was a substitution
  performanceLog?: SetLog[]; // Tracking individual sets
}

export interface SetLog {
  setNumber: number;
  repsCompleted: number;
  weightUsed: number;
  rir: number;
  rpe?: number;
  timestamp: string;
}

export interface VolumeCalculation {
  exerciseId: string;
  exerciseName: string;
  totalSets: number;
  totalReps: number;
  totalVolume: number; // Weight × Reps × Sets (tonnage)
  averageRir: number;
  sessionId: string;
  date: string;
}

export interface WeeklyVolume {
  weekStartDate: string;
  totalVolume: number;
  byMuscleGroup: {
    [muscleGroup: string]: {
      volume: number;
      sets: number;
    };
  };
  byExercise: VolumeCalculation[];
}

export interface ProgressHistory {
  exerciseId: string;
  exerciseName: string;
  personalRecords: {
    maxWeight: { weight: number; reps: number; date: string };
    maxVolume: { volume: number; date: string };
    maxReps: { reps: number; weight: number; date: string };
  };
  progressionData: {
    date: string;
    weight: number;
    reps: number;
    volume: number;
    rir: number;
  }[];
}

export interface PredictiveLoad {
  suggestedWeight: number;
  suggestedReps: number;
  rationale: string; // E.g., "+2.5kg based on RIR 2 last session"
  confidenceScore: number; // 0-1
}

export interface VoiceTrackingInput {
  audioBlob?: Blob; // Raw audio for transcription
  transcription?: string; // Pre-transcribed text
  exerciseContext?: string; // Current exercise name for context
}

export interface ParsedTrackingData {
  reps?: number;
  weight?: number;
  weightUnit?: 'kg' | 'lb';
  rir?: number;
  rpe?: number;
  confidence: number; // 0-1, how confident the parser is
  rawInput: string;
}

// Substitution types (Dev C)
export interface SubstitutionRequest {
  exerciseId: string;
  reason: string; // NLP input from user (voice or text)
  reasonCategory?: 'equipment_occupied' | 'pain_discomfort' | 'lack_space' | 'home_workout' | 'preference' | 'other';
  currentWeight: number;
  currentReps: number;
  currentRir: number;
  voiceInput?: boolean; // Flag if input came from voice
}

export interface SubstitutionSuggestion {
  exercise: Exercise;
  justification: string;
  adjustedWeight: number;
  adjustedReps: number;
  confidenceScore: number; // 0-1
  biomechanicalEquivalence: string; // Technical explanation
}

export interface SubstitutionResponse {
  suggestions: SubstitutionSuggestion[];
  originalExercise: Exercise;
  processingTime: number;
}

// Auth and profile types (Dev A)
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  injuries?: Injury[];
  preferences?: {
    preferredEquipment?: string[];
    avoidedExercises?: string[];
    goals?: Goal[];
  };
  onboarding?: OnboardingData;
  createdAt: string;
}

// Onboarding and plan types (Dev B)
export interface Injury {
  area: string; // E.g., 'lower_back', 'knee', 'shoulder'
  type?: string; // E.g., 'tendinitis', 'strain', 'chronic_pain'
  severity: 'mild' | 'moderate' | 'severe';
  restrictedPatterns?: MovementPattern[]; // Patterns to avoid
  notes?: string;
}

export interface Goal {
  type: 'hypertrophy' | 'fat_loss' | 'strength' | 'endurance' | 'conditioning';
  priority: 'primary' | 'secondary';
}

export interface OnboardingData {
  goals: Goal[];
  injuryHistory: Injury[];
  daysPerWeek: number; // 2-7 days
  sessionDuration: number; // Minutes per session (e.g., 45, 60, 90)
  equipment: EquipmentType[];
  completedAt: string;
}

export interface WorkoutPlan {
  id: string;
  userId: string;
  name: string;
  durationWeeks: number; // Mesocycle length
  microcycles: Microcycle[];
  goals: Goal[];
  volumeProfile: VolumeProfile;
  aiRationale: string; // Natural language explanation from AI
  createdAt: string;
  updatedAt: string;
}

export interface Microcycle {
  weekNumber: number;
  focus: string; // E.g., 'Accumulation', 'Intensification', 'Deload'
  sessions: WorkoutSession[];
}

export interface VolumeProfile {
  weeklyVolume: number; // Total weekly sets
  volumeDistribution: {
    [muscleGroup: string]: number; // Sets per muscle group per week
  };
  progressionStrategy: 'linear' | 'undulating' | 'block';
}

// AI types: routine builder (Dev B)
export interface RoutineBuilderRequest {
  userId: string;
  onboardingData: OnboardingData;
  userProfile: UserProfile;
}

export interface RoutineBuilderResponse {
  plan: WorkoutPlan;
  aiRationale: string; // Natural language explanation
  injuryConsiderations: string[]; // Warnings/adaptations made
  progressionNotes: string; // How to progress through the plan
}

// Database types (Dev C)
// Mirrors supabase/migrations exactly. supabase-js does not convert case: map rows in lib/supabase/<area>.ts.
type ExerciseRow = {
  id: string;
  name: string;
  muscle_group: string;
  synergist_muscles: string[] | null;
  movement_pattern: MovementPattern;
  equipment: string[] | null;
  resistance_profile: ResistanceProfile | null;
  description: string | null;
  video_url: string | null;
  embedding: string | null;
  biomechanical_tags: string[] | null;
  created_at: string;
};

type UserProfileRow = {
  id: string;
  email: string;
  name: string | null;
  experience_level: UserProfile['experienceLevel'];
  injuries: Injury[] | null;
  preferences: UserProfile['preferences'] | null;
  onboarding: OnboardingData | null;
  created_at: string;
};

type WorkoutPlanRow = {
  id: string;
  user_id: string;
  name: string;
  duration_weeks: number;
  microcycles: Microcycle[];
  goals: Goal[];
  volume_profile: VolumeProfile | null;
  ai_rationale: string | null;
  created_at: string;
  updated_at: string;
};

type WorkoutSessionRow = {
  id: string;
  user_id: string;
  plan_id: string | null;
  date: string;
  name: string;
  status: WorkoutSession['status'];
  created_at: string;
  updated_at: string;
};

type SessionExerciseRow = {
  id: string;
  session_id: string;
  exercise_id: string | null;
  sets: number;
  reps: number;
  weight: number;
  rir: number;
  rpe: number | null;
  rest_seconds: number;
  notes: string | null;
  completed: boolean;
  substituted_from: string | null;
};

type SetLogRow = {
  id: string;
  session_exercise_id: string;
  set_number: number;
  reps_completed: number;
  weight_used: number;
  rir: number;
  rpe: number | null;
  created_at: string;
};

type TableDefinition<Row, RequiredOnInsert extends keyof Row> = {
  Row: Row;
  Insert: Pick<Row, RequiredOnInsert> & Partial<Omit<Row, RequiredOnInsert>>;
  Update: Partial<Row>;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      exercises: TableDefinition<ExerciseRow, 'name' | 'muscle_group' | 'movement_pattern'>;
      user_profiles: TableDefinition<UserProfileRow, 'id' | 'email'>;
      workout_plans: TableDefinition<WorkoutPlanRow, 'user_id' | 'name' | 'duration_weeks'>;
      workout_sessions: TableDefinition<WorkoutSessionRow, 'user_id' | 'date' | 'name'>;
      session_exercises: TableDefinition<
        SessionExerciseRow,
        'session_id' | 'sets' | 'reps' | 'weight' | 'rir'
      >;
      set_logs: TableDefinition<
        SetLogRow,
        'session_exercise_id' | 'set_number' | 'reps_completed' | 'weight_used' | 'rir'
      >;
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
  };
}

export type TableRow<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
