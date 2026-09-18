import type { Modality, MovementPattern } from '../types';

export function modalityLabel(modality: Modality): string {
  switch (modality) {
    case 'FREE_WEIGHT':
      return 'Free Weight';
    case 'MACHINE_CABLE':
      return 'Machine / Cable';
    case 'MIXED':
      return 'Mixed';
  }
}

export function movementPatternLabel(pattern: MovementPattern): string {
  switch (pattern) {
    case 'HORIZONTAL_PUSH':
      return 'Push';
    case 'VERTICAL_PUSH':
      return 'Push';
    case 'HORIZONTAL_PULL':
      return 'Pull';
    case 'VERTICAL_PULL':
      return 'Pull';
    case 'HINGE':
      return 'Hinge';
    case 'SQUAT':
      return 'Squat';
    case 'CARRY':
      return 'Carry';
    case 'CORE':
      return 'Core';
    case 'ISOLATION':
      return 'Accessory';
    case 'CONDITIONING':
      return 'Cardio';
  }
}

export function formatWeight(kg: number): string {
  if (kg <= 0) return 'Bodyweight';
  return `${kg % 1 === 0 ? kg : kg.toFixed(1)} kg`;
}

export function formatRepRange(min: number, max: number): string {
  if (min === max) return `${min} reps`;
  return `${min}–${max} reps`;
}

export function formatExerciseTarget(pattern: MovementPattern, min: number, max: number): string {
  if (pattern === 'CONDITIONING') {
    return min === max ? `${min} min` : `${min}–${max} min`;
  }
  return formatRepRange(min, max);
}

export function formatExerciseLoad(pattern: MovementPattern, kg: number): string | null {
  if (pattern === 'CONDITIONING') return null;
  return formatWeight(kg);
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
