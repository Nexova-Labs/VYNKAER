import type { GeneratedWorkout, SetLog, WorkoutExercise, WorkoutSession } from '../types';
import { generateId } from '../utils/id';

function buildInitialSetLogs(targetSets: number, recommendedLoad: number, targetRepMax: number): SetLog[] {
  const now = new Date().toISOString();
  return Array.from({ length: Math.max(targetSets, 1) }, (_, i) => ({
    setNumber: i + 1,
    weight: recommendedLoad,
    reps: targetRepMax,
    completed: false,
    createdAt: now,
  }));
}

// Converts a proposed plan (GeneratedWorkout) into a loggable, persisted
// WorkoutSession the moment the athlete presses "Start Workout".
export function buildSessionFromGeneratedWorkout(generated: GeneratedWorkout, workoutNumber: number): WorkoutSession {
  const now = new Date().toISOString();
  const exercises: WorkoutExercise[] = generated.exercises.map((ex) => ({
    ...ex,
    sets: ex.sets && ex.sets.length > 0 ? ex.sets : buildInitialSetLogs(ex.targetSets, ex.recommendedLoad, ex.targetRepMax),
  }));

  return {
    id: generateId('session'),
    workoutNumber,
    date: now,
    modality: generated.modality,
    focus: generated.focus,
    status: 'IN_PROGRESS',
    targetRPE: generated.targetRPE,
    estimatedDurationMinutes: generated.estimatedDurationMinutes,
    startedAt: now,
    exercises,
    generationExplanation: generated.generationExplanation,
  };
}
