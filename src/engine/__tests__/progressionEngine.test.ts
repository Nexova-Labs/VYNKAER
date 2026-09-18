import { decideProgression } from '../progressionEngine';

const EXERCISE_ID = 'barbell-bench-press';
const REP_MIN = 6;
const REP_MAX = 8;
const LOAD = 12.5;
const INCREMENT = 2.5;

function run(
  reps: number[],
  options: { rpe?: number[]; sessionRPE?: number } = {},
) {
  const sets = reps.map((repCount, index) => ({
    reps: repCount,
    ...(options.rpe ? { rpe: options.rpe[index] } : {}),
  }));
  return decideProgression(EXERCISE_ID, REP_MIN, REP_MAX, sets, LOAD, INCREMENT, options.sessionRPE);
}

describe('progressionEngine.decideProgression', () => {
  it('increases when every set reaches the top of the range at acceptable effort', () => {
    const result = run([8, 8, 8], { rpe: [7, 8, 8], sessionRPE: 7 });
    expect(result.decision).toBe('INCREASE');
    expect(result.recommendedLoad).toBe(LOAD + INCREMENT);
    expect(result.currentLoad).toBe(LOAD);
    expect(result.exerciseId).toBe(EXERCISE_ID);
    expect(result.reason).toMatch(/top of the target range/i);
  });

  it('increases on clean 8/8/8 even when no RPE was logged', () => {
    expect(run([8, 8, 8]).decision).toBe('INCREASE');
  });

  it('maintains when reps stay inside the range but not all at the top', () => {
    const result = run([8, 7, 6]);
    expect(result.decision).toBe('MAINTAIN');
    expect(result.recommendedLoad).toBe(LOAD);
    expect(result.reason).toMatch(/maintaining/i);
    expect(result.reason).toMatch(/execution|total reps/i);
  });

  it('maintains when multiple sets fall below the minimum at normal effort', () => {
    const result = run([5, 5, 4], { rpe: [7, 8, 8], sessionRPE: 7 });
    expect(result.decision).toBe('MAINTAIN');
    expect(result.recommendedLoad).toBe(LOAD);
    expect(result.reason).toMatch(/below the 6-rep minimum/i);
  });

  it('reduces when reps fall short and the effort was very high (set RPE)', () => {
    const result = run([5, 5, 4], { rpe: [9, 9, 9.5] });
    expect(result.decision).toBe('REDUCE');
    expect(result.recommendedLoad).toBe(LOAD - INCREMENT);
    expect(result.reason).toMatch(/excessive strain/i);
  });

  it('reduces when reps fall short and the session RPE was very high', () => {
    const result = run([5, 5, 4], { sessionRPE: 9 });
    expect(result.decision).toBe('REDUCE');
    expect(result.decision).not.toBe('INCREASE');
    expect(result.recommendedLoad).toBeLessThan(LOAD);
  });

  it('never increases when reps were good but effort was extreme', () => {
    const fromSets = run([8, 8, 8], { rpe: [9, 9, 9.5] });
    expect(fromSets.decision).toBe('MAINTAIN');
    expect(fromSets.recommendedLoad).toBe(LOAD);
    expect(fromSets.reason).toMatch(/avoiding automatic progression/i);

    const fromSession = run([8, 8, 8], { sessionRPE: 9.5 });
    expect(fromSession.decision).not.toBe('INCREASE');
    expect(fromSession.recommendedLoad).toBe(LOAD);
  });

  it('does not increase when a single set was above the acceptable RPE ceiling', () => {
    const result = run([8, 8, 8], { rpe: [8, 8, 9] });
    expect(result.decision).not.toBe('INCREASE');
  });

  it('handles an empty log by repeating the current load', () => {
    const result = decideProgression(EXERCISE_ID, REP_MIN, REP_MAX, [], LOAD, INCREMENT);
    expect(result.decision).toBe('MAINTAIN');
    expect(result.recommendedLoad).toBe(LOAD);
    expect(result.reason.length).toBeGreaterThan(0);
  });

  it('never recommends a negative load', () => {
    const result = decideProgression(EXERCISE_ID, REP_MIN, REP_MAX, [{ reps: 2, rpe: 10 }, { reps: 2, rpe: 10 }], 1, 2.5, 9);
    expect(result.recommendedLoad).toBeGreaterThanOrEqual(0);
  });

  it('respects a higher isolation rep range', () => {
    const result = decideProgression('biceps-curl', 8, 12, [{ reps: 12 }, { reps: 12 }, { reps: 12 }], 10, 1.25, 7);
    expect(result.decision).toBe('INCREASE');
    expect(result.recommendedLoad).toBe(11.25);
  });
});
