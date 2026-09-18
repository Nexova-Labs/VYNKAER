// Core domain types for VYNKÆR Training.
// These types are the shared contract between the training engine,
// persistence layer, and UI. Keep this file dependency-free.

export type Modality = 'FREE_WEIGHT' | 'MACHINE_CABLE' | 'MIXED';

export type MovementPattern =
  | 'HORIZONTAL_PUSH'
  | 'VERTICAL_PUSH'
  | 'HORIZONTAL_PULL'
  | 'VERTICAL_PULL'
  | 'HINGE'
  | 'SQUAT'
  | 'CARRY'
  | 'CORE'
  | 'ISOLATION'
  | 'CONDITIONING';

export type MuscleGroup =
  | 'CHEST'
  | 'BACK'
  | 'SHOULDERS'
  | 'ARMS'
  | 'LEGS'
  | 'GLUTES'
  | 'CORE'
  | 'FULL_BODY'
  | 'CARDIO';

export type Equipment =
  | 'BARBELL'
  | 'DUMBBELL'
  | 'MACHINE'
  | 'CABLE'
  | 'BODYWEIGHT'
  | 'BIKE'
  | 'OTHER';

export type TrainingGoal =
  | 'STRENGTH'
  | 'MUSCLE'
  | 'CONDITIONING'
  | 'MOVEMENT_QUALITY'
  | 'PUSH_UP_MILESTONE';

export type TrainingStyle = 'STRENGTH' | 'HYPERTROPHY' | 'CONDITIONING' | 'MOBILITY';

export type LimitationArea = 'KNEE' | 'SHOULDER' | 'LOWER_BACK' | 'ELBOW' | 'WRIST' | 'HIP' | 'OTHER';

export interface AthleteLimitation {
  area: LimitationArea;
  note?: string;
  active: boolean;
  conservativeMode: boolean;
}

export type PreferenceTag =
  | 'FARMER_CARRIES'
  | 'CABLE_PULL_THROUGHS'
  | 'ROWS'
  | 'PRESSES'
  | 'FUNCTIONAL_PATTERNS'
  | 'VARIETY';

export interface Milestone {
  id: string;
  name: string;
  stages: string[];
  currentStageIndex: number;
  active: boolean;
}

export interface AthleteProfile {
  id: string;
  displayName: string;
  trainingGoal: TrainingGoal;
  trainingStyles: TrainingStyle[];
  sessionsPerWeek: number;
  primaryRepRange: [number, number];
  preferredDurationMinutes: number;
  conditioningEnabled: boolean;
  preferredCardio: string;
  varietyEnabled: boolean;
  rotationSequence: Modality[];
  limitations: AthleteLimitation[];
  preferences: PreferenceTag[];
  currentMilestones: Milestone[];
  createdAt: string;
  updatedAt: string;
}

export interface Substitution {
  exerciseId: string;
  reason?: string;
}

export interface Exercise {
  id: string;
  name: string;
  movementPattern: MovementPattern;
  muscleGroups: MuscleGroup[];
  equipment: Equipment;
  modalityCompatibility: Modality[];
  defaultRepRange: [number, number];
  loadIncrement: number;
  isKneeDominant: boolean;
  isLowerBackDominant: boolean;
  isShoulderDominant: boolean;
  priority: number; // higher = kept first when shortening a session
  tags: string[];
  substitutions: Substitution[];
}

export type SessionStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';

export interface SetLog {
  setNumber: number;
  weight: number;
  reps: number;
  rpe?: number;
  completed: boolean;
  note?: string;
  createdAt: string;
}

export type ProgressionDecisionType = 'INCREASE' | 'MAINTAIN' | 'REDUCE' | 'DELOAD' | 'SUBSTITUTE';

export interface ProgressionDecision {
  exerciseId: string;
  decision: ProgressionDecisionType;
  currentLoad: number;
  recommendedLoad: number;
  reason: string;
}

export interface WorkoutExercise {
  exerciseId: string;
  order: number;
  targetSets: number;
  targetRepMin: number;
  targetRepMax: number;
  recommendedLoad: number;
  recommendationReason: string;
  optional: boolean;
  substitutedFromExerciseId?: string;
  skipped: boolean;
  sets: SetLog[];
  notes?: string;
}

export interface SessionFeedback {
  sessionRPE: number;
  limitationBefore: number;
  limitationAfter: number;
  cardioMinutes: number;
  strongestMovement?: string;
  weakestMovement?: string;
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  workoutNumber: number;
  date: string;
  modality: Modality;
  focus: string;
  status: SessionStatus;
  targetRPE: number;
  estimatedDurationMinutes: number;
  startedAt?: string;
  completedAt?: string;
  exercises: WorkoutExercise[];
  feedback?: SessionFeedback;
  generationExplanation: string[];
}

export interface ExerciseProgressionState {
  exerciseId: string;
  lastLoad: number;
  lastRepsPerSet: number[];
  lastCompletedAt: string;
  consecutiveCleanSessions: number;
  trend: ProgressionDecisionType;
}

export interface TrainingState {
  lastWorkoutId: string | null;
  lastModality: Modality | null;
  nextModality: Modality;
  sessionsCompleted: number;
  lastCardioMinutes: number;
  recentSessionRPE: number[];
  exerciseProgression: Record<string, ExerciseProgressionState>;
  activeLimitations: LimitationArea[];
  currentWorkoutNumber: number;
  updatedAt: string;
}

export interface GeneratedWorkout {
  modality: Modality;
  focus: string;
  targetRPE: number;
  estimatedDurationMinutes: number;
  exercises: WorkoutExercise[];
  cardioMinutes: number;
  generationExplanation: string[];
}

export interface WorkoutGenerationContext {
  profile: AthleteProfile;
  trainingState: TrainingState;
  history: WorkoutSession[];
  exerciseLibrary: Exercise[];
  requestedDurationMinutes: number;
  activeLimitations: LimitationArea[];
  workoutNumber: number;
  variantSeed?: number;
}

export interface AppSettings {
  onboardingComplete: boolean;
  hapticsEnabled: boolean;
}

// --- Coach layer ---
// Kept separate from the deterministic engine on purpose: the Coach may
// interpret feedback and propose structural adaptations, but it never
// mutates a workout directly. The UI applies a proposal only after the
// athlete explicitly confirms it.

export type CoachAdaptationType =
  | 'SHORTEN_DURATION'
  | 'REMOVE_MOVEMENT_PATTERN'
  | 'INCREASE_CARDIO'
  | 'SUBSTITUTE_EXERCISE'
  | 'FLAG_LIMITATION'
  | 'EASIER'
  | 'HARDER';

export interface WorkoutAdaptation {
  type: CoachAdaptationType;
  label: string;
  targetDurationMinutes?: number;
  movementPattern?: MovementPattern;
  cardioDeltaMinutes?: number;
  exerciseId?: string;
  limitationArea?: LimitationArea;
}

export interface CoachMessage {
  id: string;
  role: 'user' | 'coach';
  text: string;
  adaptation?: WorkoutAdaptation;
  createdAt: string;
}

export interface CoachContext {
  profile: AthleteProfile;
  trainingState: TrainingState;
  activeWorkout: WorkoutSession | null;
  currentPlan: GeneratedWorkout | null;
  history: WorkoutSession[];
}

export interface CoachResponse {
  message: string;
  proposedAdaptation?: WorkoutAdaptation;
}

export interface CoachProvider {
  sendMessage(message: string, context: CoachContext): Promise<CoachResponse>;
}
