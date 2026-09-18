// VYNKÆR Training — seeded demo data for Athlete 001.
//
// This is the "already been training for a while" fixture the app boots with:
// a profile, thirteen completed sessions, and the derived training state that
// the engine reads to decide what comes next.
//
// Logging convention: loads are recorded the way the athlete enters them —
// per side for dumbbells and plate-loaded machines, bar-side load for the
// barbell, minutes for conditioning. The numbers are demo values; no engine
// rule is tuned to them.

import { resolveRepRange } from '../engine/workoutGenerator';
import { getNextModality } from '../engine/rotationEngine';
import type {
  AthleteProfile,
  ExerciseProgressionState,
  Modality,
  ProgressionDecisionType,
  SessionFeedback,
  SetLog,
  TrainingState,
  WorkoutExercise,
  WorkoutSession,
} from '../types';
import { EXERCISE_BY_ID } from './exercises';

/** The app's "today" for the seeded demo dataset. */
export const SEED_TODAY = '2026-09-18';

export const SEED_ATHLETE_PROFILE: AthleteProfile = {
  id: 'athlete-001',
  displayName: 'Athlete 001',
  trainingGoal: 'STRENGTH',
  trainingStyles: ['STRENGTH', 'HYPERTROPHY', 'CONDITIONING'],
  sessionsPerWeek: 3,
  primaryRepRange: [6, 8],
  preferredDurationMinutes: 60,
  conditioningEnabled: true,
  preferredCardio: 'Bike',
  varietyEnabled: true,
  rotationSequence: ['FREE_WEIGHT', 'MACHINE_CABLE', 'MIXED'],
  limitations: [
    {
      area: 'KNEE',
      note: 'Mild knee sensitivity under deep loaded flexion. Prefers hip-dominant and low-impact work.',
      active: true,
      conservativeMode: true,
    },
  ],
  preferences: ['FARMER_CARRIES', 'CABLE_PULL_THROUGHS', 'ROWS', 'PRESSES', 'FUNCTIONAL_PATTERNS'],
  currentMilestones: [
    {
      id: 'pushup-6-strict',
      name: '6 Strict Push-Ups',
      stages: ['Wall', 'High Incline', 'Lower Incline', 'Eccentric', 'Full Repetition', '6 Strict Repetitions'],
      currentStageIndex: 1,
      active: true,
    },
  ],
  createdAt: '2026-06-02T09:00:00.000Z',
  updatedAt: '2026-09-14T19:20:00.000Z',
};

// ---------------------------------------------------------------------------
// Session blueprints
// ---------------------------------------------------------------------------

/** [exerciseId, load, reps per set, RPE for the exercise] */
type SeedEntry = [string, number, number[], number?];

interface SessionBlueprint {
  date: string;
  modality: Modality;
  focus: string;
  targetRPE: number;
  estimatedDurationMinutes: number;
  entries: SeedEntry[];
  feedback: SessionFeedback;
  generationExplanation: string[];
}

const SESSION_BLUEPRINTS: SessionBlueprint[] = [
  {
    date: '2026-08-15',
    modality: 'FREE_WEIGHT',
    focus: 'Strength + Conditioning — Push / Pull / Hinge',
    targetRPE: 7,
    estimatedDurationMinutes: 58,
    entries: [
      ['barbell-bench-press', 10, [6, 6, 5], 8],
      ['seated-db-shoulder-press', 12.5, [8, 7, 6], 8],
      ['chest-supported-db-row', 17.5, [10, 9, 8], 7],
      ['db-romanian-deadlift', 15, [10, 10, 9], 7],
      ['farmer-walk', 25, [2, 2, 2], 7],
      ['bike-conditioning', 0, [14]],
    ],
    feedback: { sessionRPE: 7, limitationBefore: 1, limitationAfter: 1, cardioMinutes: 14 },
    generationExplanation: [
      'First recorded session, so the rotation starts with Free Weight.',
      'Conservative selection is on for your knee: no deep loaded knee flexion today.',
    ],
  },
  {
    date: '2026-08-17',
    modality: 'MACHINE_CABLE',
    focus: 'Strength + Conditioning — Push / Pull / Hinge',
    targetRPE: 7,
    estimatedDurationMinutes: 60,
    entries: [
      ['machine-chest-press', 15, [8, 8, 7], 7],
      ['machine-shoulder-press', 12.5, [8, 8, 7], 7],
      ['neutral-grip-lat-pulldown', 40, [8, 8, 8], 7],
      ['seated-cable-row', 20, [10, 10, 9], 7],
      ['cable-pull-through', 12.5, [12, 12, 11], 6],
      ['rope-triceps-pushdown', 15, [12, 12, 10], 7],
      ['bike-conditioning', 0, [14]],
    ],
    feedback: { sessionRPE: 7, limitationBefore: 1, limitationAfter: 1, cardioMinutes: 14 },
    generationExplanation: [
      'Your previous session was Free Weight, so today advances to Machine/Cable.',
      'Pulldown and row loads held to build clean reps first.',
    ],
  },
  {
    date: '2026-08-20',
    modality: 'MIXED',
    focus: 'Strength + Conditioning — Push / Pull / Carry',
    targetRPE: 7,
    estimatedDurationMinutes: 60,
    entries: [
      ['incline-db-press', 15, [10, 9, 8], 7],
      ['cable-shoulder-press', 12.5, [10, 10, 9], 7],
      ['neutral-grip-lat-pulldown', 42.5, [8, 7, 7], 8],
      ['seated-cable-row', 22.5, [10, 9, 9], 7],
      ['cable-pull-through', 12.5, [12, 12, 12], 6],
      ['farmer-walk', 25, [2, 2, 2], 7],
      ['bike-conditioning', 0, [15]],
    ],
    feedback: { sessionRPE: 7, limitationBefore: 1, limitationAfter: 1, cardioMinutes: 15 },
    generationExplanation: [
      'Your previous session was Machine/Cable, so today advances to Mixed.',
      'Pulldown moved up after three clean sets last time.',
    ],
  },
  {
    date: '2026-08-22',
    modality: 'FREE_WEIGHT',
    focus: 'Strength + Conditioning — Push / Pull / Hinge',
    targetRPE: 7,
    estimatedDurationMinutes: 58,
    entries: [
      ['barbell-bench-press', 10, [6, 6, 6], 7],
      ['seated-db-shoulder-press', 12.5, [8, 8, 7], 7],
      ['chest-supported-db-row', 17.5, [10, 10, 9], 7],
      ['db-romanian-deadlift', 17.5, [9, 9, 8], 7],
      ['farmer-walk', 25, [3, 2, 2], 7],
      ['bike-conditioning', 0, [15]],
    ],
    feedback: { sessionRPE: 7, limitationBefore: 1, limitationAfter: 1, cardioMinutes: 15 },
    generationExplanation: [
      'Your previous session was Mixed, so the rotation returns to Free Weight.',
      'Romanian deadlift progressed after two controlled sessions.',
    ],
  },
  {
    date: '2026-08-25',
    modality: 'MACHINE_CABLE',
    focus: 'Strength + Conditioning — Push / Pull / Hinge',
    targetRPE: 7,
    estimatedDurationMinutes: 55,
    entries: [
      ['machine-chest-press', 17.5, [7, 6, 5], 9],
      ['machine-shoulder-press', 15, [6, 6, 5], 9],
      ['neutral-grip-lat-pulldown', 45, [8, 7, 6], 8],
      ['seated-cable-row', 22.5, [10, 10, 10], 7],
      ['cable-pull-through', 15, [12, 11, 10], 7],
      ['rope-triceps-pushdown', 15, [12, 12, 12], 7],
      ['bike-conditioning', 0, [12]],
    ],
    feedback: {
      sessionRPE: 8,
      limitationBefore: 2,
      limitationAfter: 2,
      cardioMinutes: 12,
      weakestMovement: 'machine-shoulder-press',
      notes: 'Heavy day, pressing felt slow. Cut the bike short.',
    },
    generationExplanation: [
      'Your previous session was Free Weight, so today advances to Machine/Cable.',
      'Both presses stepped up after clean top-of-range work.',
    ],
  },
  {
    date: '2026-08-27',
    modality: 'MIXED',
    focus: 'Strength + Conditioning — Push / Pull / Carry',
    targetRPE: 7,
    estimatedDurationMinutes: 60,
    entries: [
      ['incline-db-press', 17.5, [8, 8, 7], 8],
      ['cable-shoulder-press', 12.5, [12, 11, 10], 7],
      ['neutral-grip-lat-pulldown', 45, [8, 8, 7], 7],
      ['seated-cable-row', 25, [9, 9, 8], 7],
      ['cable-pull-through', 15, [12, 12, 12], 6],
      ['farmer-walk', 27.5, [2, 2, 2], 7],
      ['bike-conditioning', 0, [15]],
    ],
    feedback: { sessionRPE: 7, limitationBefore: 1, limitationAfter: 1, cardioMinutes: 15 },
    generationExplanation: [
      'Your previous session was Machine/Cable, so today advances to Mixed.',
      'Carries progressed to 27.5kg per hand.',
    ],
  },
  {
    date: '2026-08-30',
    modality: 'FREE_WEIGHT',
    focus: 'Strength + Conditioning — Push / Pull / Hinge',
    targetRPE: 7,
    estimatedDurationMinutes: 58,
    entries: [
      ['barbell-bench-press', 12.5, [6, 5, 5], 8],
      ['seated-db-shoulder-press', 15, [6, 6, 6], 8],
      ['chest-supported-db-row', 20, [8, 8, 7], 8],
      ['db-romanian-deadlift', 17.5, [10, 9, 9], 7],
      ['farmer-walk', 27.5, [2, 2, 2], 7],
      ['bike-conditioning', 0, [15]],
    ],
    feedback: {
      sessionRPE: 8,
      limitationBefore: 1,
      limitationAfter: 2,
      cardioMinutes: 15,
      notes: 'New bench load felt heavy on the last two sets.',
    },
    generationExplanation: [
      'Your previous session was Mixed, so the rotation returns to Free Weight.',
      'Bench press moved to 12.5kg per side after three clean sets.',
    ],
  },
  {
    date: '2026-09-01',
    modality: 'MACHINE_CABLE',
    focus: 'Strength + Conditioning — Push / Pull / Hinge',
    targetRPE: 7,
    estimatedDurationMinutes: 60,
    entries: [
      ['machine-chest-press', 17.5, [8, 7, 7], 8],
      ['machine-shoulder-press', 15, [8, 7, 6], 8],
      ['neutral-grip-lat-pulldown', 47.5, [8, 7, 7], 8],
      ['seated-cable-row', 25, [10, 10, 9], 7],
      ['cable-pull-through', 15, [12, 12, 12], 6],
      ['rope-triceps-pushdown', 17.5, [12, 11, 10], 7],
      ['bike-conditioning', 0, [16]],
    ],
    feedback: { sessionRPE: 7, limitationBefore: 1, limitationAfter: 1, cardioMinutes: 16 },
    generationExplanation: [
      'Your previous session was Free Weight, so today advances to Machine/Cable.',
      'Pressing loads held after the previous high-effort session.',
    ],
  },
  {
    date: '2026-09-04',
    modality: 'MIXED',
    focus: 'Strength + Conditioning — Push / Pull / Carry',
    targetRPE: 7,
    estimatedDurationMinutes: 60,
    entries: [
      ['incline-db-press', 17.5, [9, 8, 8], 7],
      ['cable-shoulder-press', 15, [10, 10, 9], 7],
      ['neutral-grip-lat-pulldown', 47.5, [8, 8, 8], 7],
      ['seated-cable-row', 27.5, [9, 8, 8], 8],
      ['cable-pull-through', 17.5, [11, 10, 10], 7],
      ['farmer-walk', 27.5, [3, 2, 2], 7],
      ['bike-conditioning', 0, [16]],
    ],
    feedback: { sessionRPE: 7, limitationBefore: 1, limitationAfter: 0, cardioMinutes: 16 },
    generationExplanation: [
      'Your previous session was Machine/Cable, so today advances to Mixed.',
      'Pull-through progressed to 17.5kg.',
    ],
  },
  {
    date: '2026-09-06',
    modality: 'FREE_WEIGHT',
    focus: 'Strength + Conditioning — Push / Pull / Hinge',
    targetRPE: 7,
    estimatedDurationMinutes: 58,
    entries: [
      ['barbell-bench-press', 12.5, [6, 6, 6], 8],
      ['seated-db-shoulder-press', 15, [8, 7, 6], 8],
      ['chest-supported-db-row', 20, [9, 8, 8], 7],
      ['db-romanian-deadlift', 20, [9, 8, 8], 8],
      ['farmer-walk', 27.5, [3, 3, 2], 7],
      ['bike-conditioning', 0, [16]],
    ],
    feedback: { sessionRPE: 7, limitationBefore: 1, limitationAfter: 1, cardioMinutes: 16 },
    generationExplanation: [
      'Your previous session was Mixed, so the rotation returns to Free Weight.',
      'Bench press held at 12.5kg per side to consolidate the new load.',
    ],
  },
  {
    date: '2026-09-09',
    modality: 'MACHINE_CABLE',
    focus: 'Strength + Conditioning — Push / Pull / Hinge',
    targetRPE: 7,
    estimatedDurationMinutes: 60,
    entries: [
      ['machine-chest-press', 20, [8, 7, 6], 8],
      ['machine-shoulder-press', 17.5, [7, 6, 6], 8],
      ['neutral-grip-lat-pulldown', 50, [8, 7, 7], 8],
      ['seated-cable-row', 30, [9, 8, 8], 8],
      ['cable-pull-through', 17.5, [12, 12, 11], 7],
      ['rope-triceps-pushdown', 17.5, [12, 12, 12], 7],
      ['bike-conditioning', 0, [17]],
    ],
    feedback: { sessionRPE: 8, limitationBefore: 1, limitationAfter: 1, cardioMinutes: 17 },
    generationExplanation: [
      'Your previous session was Free Weight, so today advances to Machine/Cable.',
      'Chest press and row both stepped up after top-of-range work.',
    ],
  },
  {
    date: '2026-09-11',
    modality: 'MIXED',
    focus: 'Strength + Conditioning — Push / Pull / Carry',
    targetRPE: 7,
    estimatedDurationMinutes: 60,
    entries: [
      ['incline-db-press', 20, [8, 8, 7], 8],
      ['cable-shoulder-press', 15, [12, 11, 10], 7],
      ['neutral-grip-lat-pulldown', 50, [8, 8, 8], 7],
      ['seated-cable-row', 30, [10, 9, 9], 7],
      ['cable-pull-through', 20, [10, 10, 9], 7],
      ['farmer-walk', 30, [2, 2, 2], 8],
      ['bike-conditioning', 0, [17]],
    ],
    feedback: { sessionRPE: 7, limitationBefore: 1, limitationAfter: 1, cardioMinutes: 17 },
    generationExplanation: [
      'Your previous session was Machine/Cable, so today advances to Mixed.',
      'Carries progressed to 30kg per hand.',
    ],
  },
  {
    date: '2026-09-14',
    modality: 'FREE_WEIGHT',
    focus: 'Strength + Conditioning — Push / Pull / Hinge',
    targetRPE: 7,
    estimatedDurationMinutes: 58,
    entries: [
      ['barbell-bench-press', 12.5, [6, 6, 6], 8],
      ['seated-db-shoulder-press', 15, [8, 8, 7], 7],
      ['chest-supported-db-row', 20, [10, 9, 8], 7],
      ['db-romanian-deadlift', 20, [10, 9, 9], 7],
      ['farmer-walk', 30, [3, 2, 2], 7],
      ['bike-conditioning', 0, [18]],
    ],
    feedback: {
      sessionRPE: 7,
      limitationBefore: 1,
      limitationAfter: 1,
      cardioMinutes: 18,
      strongestMovement: 'chest-supported-db-row',
    },
    generationExplanation: [
      'Your previous session was Mixed, so the rotation returns to Free Weight.',
      'Rows and carries both improved on total reps at the same load.',
    ],
  },
];

// ---------------------------------------------------------------------------
// Blueprint -> WorkoutSession
// ---------------------------------------------------------------------------

function isoAt(date: string, hour: number, minute: number): string {
  const hh = String(hour).padStart(2, '0');
  const mm = String(minute).padStart(2, '0');
  return `${date}T${hh}:${mm}:00.000Z`;
}

function buildSets(date: string, entryIndex: number, load: number, reps: number[], rpe?: number): SetLog[] {
  return reps.map((repCount, setIndex) => {
    const minutesIn = entryIndex * 8 + setIndex * 3;
    return {
      setNumber: setIndex + 1,
      weight: load,
      reps: repCount,
      ...(typeof rpe === 'number' ? { rpe } : {}),
      completed: true,
      createdAt: isoAt(date, 17 + Math.floor(minutesIn / 60), minutesIn % 60),
    };
  });
}

function buildWorkoutExercise(date: string, entry: SeedEntry, index: number): WorkoutExercise {
  const [exerciseId, load, reps, rpe] = entry;
  const exercise = EXERCISE_BY_ID[exerciseId];

  if (!exercise) {
    throw new Error(`Seed data references unknown exercise id: ${exerciseId}`);
  }

  const isConditioning = exercise.movementPattern === 'CONDITIONING';
  const [repMin, repMax] = isConditioning
    ? [reps[0], reps[0]]
    : resolveRepRange(exercise, SEED_ATHLETE_PROFILE);

  return {
    exerciseId,
    order: index + 1,
    targetSets: reps.length,
    targetRepMin: repMin,
    targetRepMax: repMax,
    recommendedLoad: load,
    recommendationReason: isConditioning
      ? `${reps[0]} minutes of steady bike work.`
      : `Programmed at ${load}kg for ${repMin}-${repMax} reps based on the previous session.`,
    optional: false,
    skipped: false,
    sets: buildSets(date, index, load, reps, rpe),
  };
}

function buildSession(blueprint: SessionBlueprint, index: number): WorkoutSession {
  const workoutNumber = index + 1;
  return {
    id: `session-${String(workoutNumber).padStart(3, '0')}`,
    workoutNumber,
    date: blueprint.date,
    modality: blueprint.modality,
    focus: blueprint.focus,
    status: 'COMPLETED',
    targetRPE: blueprint.targetRPE,
    estimatedDurationMinutes: blueprint.estimatedDurationMinutes,
    startedAt: isoAt(blueprint.date, 17, 0),
    completedAt: isoAt(blueprint.date, 18, 5),
    exercises: blueprint.entries.map((entry, entryIndex) =>
      buildWorkoutExercise(blueprint.date, entry, entryIndex),
    ),
    feedback: blueprint.feedback,
    generationExplanation: blueprint.generationExplanation,
  };
}

export const SEED_WORKOUT_HISTORY: WorkoutSession[] = SESSION_BLUEPRINTS.map(buildSession);

// ---------------------------------------------------------------------------
// Derived training state
// ---------------------------------------------------------------------------

function buildExerciseProgression(history: WorkoutSession[]): Record<string, ExerciseProgressionState> {
  const progression: Record<string, ExerciseProgressionState> = {};

  for (const session of history) {
    for (const workoutExercise of session.exercises) {
      const reps = workoutExercise.sets.filter((set) => set.completed).map((set) => set.reps);
      if (reps.length === 0) {
        continue;
      }

      const previous = progression[workoutExercise.exerciseId];
      const load = workoutExercise.recommendedLoad;
      const wasClean = reps.every((rep) => rep >= workoutExercise.targetRepMax);

      let trend: ProgressionDecisionType = 'MAINTAIN';
      if (previous) {
        if (load > previous.lastLoad) {
          trend = 'INCREASE';
        } else if (load < previous.lastLoad) {
          trend = 'REDUCE';
        }
      }

      progression[workoutExercise.exerciseId] = {
        exerciseId: workoutExercise.exerciseId,
        lastLoad: load,
        lastRepsPerSet: reps,
        lastCompletedAt: session.completedAt ?? isoAt(session.date, 18, 5),
        consecutiveCleanSessions: wasClean ? (previous?.consecutiveCleanSessions ?? 0) + 1 : 0,
        trend,
      };
    }
  }

  return progression;
}

const lastSession = SEED_WORKOUT_HISTORY[SEED_WORKOUT_HISTORY.length - 1];

export const SEED_TRAINING_STATE: TrainingState = {
  lastWorkoutId: lastSession.id,
  lastModality: lastSession.modality,
  nextModality: getNextModality(lastSession.modality, SEED_ATHLETE_PROFILE.rotationSequence),
  sessionsCompleted: SEED_WORKOUT_HISTORY.length,
  lastCardioMinutes: lastSession.feedback?.cardioMinutes ?? 0,
  recentSessionRPE: SEED_WORKOUT_HISTORY.slice(-3).map((session) => session.feedback?.sessionRPE ?? 7),
  exerciseProgression: buildExerciseProgression(SEED_WORKOUT_HISTORY),
  activeLimitations: ['KNEE'],
  currentWorkoutNumber: SEED_WORKOUT_HISTORY.length + 1,
  updatedAt: `${SEED_TODAY}T07:00:00.000Z`,
};
