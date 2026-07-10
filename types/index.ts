// Core Exercise Types
export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  synergistMuscles?: string[]; // Secondary muscles activated
  movementPattern: 'push_horizontal' | 'push_vertical' | 'pull_horizontal' | 'pull_vertical' | 'squat' | 'hinge' | 'lunge' | 'carry';
  equipment: string[];
  resistanceProfile?: 'constant' | 'ascending' | 'descending' | 'accommodating'; // Resistance curve
  description?: string;
  videoUrl?: string;
  embedding?: number[]; // pgvector for semantic search
  biomechanicalTags?: string[]; // E.g., 'unilateral', 'compound', 'isolation'
}

// Session & Workout Types
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

// AI Substitution Types
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

// Volume Tracking & Progress Types
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

// Voice Input & NLP Types
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

// Routine Builder AI Request/Response Types
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

// User Profile Types
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

// Onboarding & Routine Builder Types
export interface OnboardingData {
  goals: Goal[];
  injuryHistory: Injury[];
  daysPerWeek: number; // 2-7 days
  sessionDuration: number; // Minutes per session (e.g., 45, 60, 90)
  equipment: EquipmentType[];
  completedAt: string;
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

// Routine Builder Output
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

// Database Types (for Supabase)
export interface Database {
  public: {
    Tables: {
      exercises: {
        Row: Exercise;
        Insert: Omit<Exercise, 'id'>;
        Update: Partial<Omit<Exercise, 'id'>>;
      };
      workout_sessions: {
        Row: WorkoutSession;
        Insert: Omit<WorkoutSession, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<Omit<WorkoutSession, 'id' | 'createdAt' | 'updatedAt'>>;
      };
      session_exercises: {
        Row: SessionExercise;
        Insert: Omit<SessionExercise, 'id'>;
        Update: Partial<Omit<SessionExercise, 'id'>>;
      };
      user_profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'id' | 'createdAt'>;
        Update: Partial<Omit<UserProfile, 'id' | 'createdAt'>>;
      };
    };
  };
}
