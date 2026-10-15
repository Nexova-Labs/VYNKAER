export type TabType = 'home' | 'train' | 'progress' | 'coach' | 'settings';

export interface ExerciseSet {
  id: number;
  setNumber: string;
  tag: 'W' | 'NOW' | 'DONE';
  prevLoad: number;
  prevReps: number;
  load: number;
  reps: number;
  completed: boolean;
  locked: boolean;
  isCurrent: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  indexTag: string;
  category: string;
  targetSets: number;
  targetReps: number;
  targetLoad: number;
  targetRpe: number;
  restTimeSec: number;
  sets: ExerciseSet[];
}

export interface SessionHistory {
  date: string;
  timeUtc: string;
  badge: string;
  badgeType: 'pr' | 'standard' | 'deload';
  setsReps: string;
  rpe: string;
  volumeKg: number;
}

export interface TrajectoryDataPoint {
  label: string;
  date: string;
  weight: number;
  x: number;
  y: number;
}
