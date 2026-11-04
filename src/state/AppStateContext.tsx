import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../components/Text';
import * as Haptics from 'expo-haptics';

import { colors, radius, spacing, typography } from '../theme';

import type {
  AppSettings,
  AthleteLimitation,
  AthleteProfile,
  CoachResponse,
  GeneratedWorkout,
  LimitationArea,
  SessionFeedback,
  SetLog,
  TrainingState,
  WorkoutAdaptation,
  WorkoutExercise,
  WorkoutSession,
} from '../types';
import { EXERCISE_LIBRARY } from '../data/exercises';
import { generateWorkout, getNextModality } from '../engine';
import {
  AthleteRepository,
  SettingsRepository,
  TrainingStateRepository,
  WorkoutRepository,
} from '../services/storage';
import { DemoCoachProvider } from '../services/coach';
import { buildSessionFromGeneratedWorkout } from './sessionBuilder';
import { applyStructuralAdaptation, computeAdaptationMetaPatch } from './adaptation';
import { applySessionProgression } from './progression';

const coachProvider = new DemoCoachProvider();

function deriveActiveLimitations(limitations: AthleteLimitation[]): LimitationArea[] {
  return limitations.filter((l) => l.active).map((l) => l.area);
}

interface AppStateValue {
  loading: boolean;
  profile: AthleteProfile;
  history: WorkoutSession[];
  trainingState: TrainingState;
  settings: AppSettings;
  activeWorkout: WorkoutSession | null;
  currentPlan: GeneratedWorkout | null;

  startWorkout: () => void;
  regeneratePlan: () => void;
  updateSetLog: (exerciseId: string, setNumber: number, patch: Partial<SetLog>) => void;
  toggleSetCompleted: (exerciseId: string, setNumber: number) => void;
  addSet: (exerciseId: string) => void;
  removeSet: (exerciseId: string, setNumber: number) => void;
  updateRecommendedLoad: (exerciseId: string, load: number) => void;
  skipExercise: (exerciseId: string) => void;
  substituteExercise: (exerciseId: string) => void;
  finishWorkout: (feedback: SessionFeedback) => Promise<void>;
  applyCoachAdaptation: (adaptation: WorkoutAdaptation) => void;
  sendCoachMessage: (text: string) => Promise<CoachResponse>;
  updateProfile: (patch: Partial<AthleteProfile>) => Promise<void>;
  resetDemoData: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

const AppStateCtx = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<AthleteProfile | null>(null);
  const [history, setHistory] = useState<WorkoutSession[]>([]);
  const [trainingState, setTrainingState] = useState<TrainingState | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [activeWorkout, setActiveWorkoutState] = useState<WorkoutSession | null>(null);
  const [currentPlan, setCurrentPlan] = useState<GeneratedWorkout | null>(null);
  const [variantSeed, setVariantSeed] = useState(0);
  // Set when device storage cannot be read. We then show a retry screen instead of booting on demo
  // data, which a later save would write over the athlete's real history (audit D1).
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);

  const setActiveWorkout = useCallback((session: WorkoutSession | null) => {
    setActiveWorkoutState(session);
    void WorkoutRepository.saveActiveWorkout(session);
  }, []);

  const refreshPlan = useCallback(
    (seed: number, athlete: AthleteProfile, state: TrainingState, hist: WorkoutSession[]) => {
      const plan = generateWorkout({
        profile: athlete,
        trainingState: state,
        history: hist,
        exerciseLibrary: EXERCISE_LIBRARY,
        requestedDurationMinutes: athlete.preferredDurationMinutes,
        activeLimitations: state.activeLimitations,
        workoutNumber: state.currentWorkoutNumber,
        variantSeed: seed,
      });
      setCurrentPlan(plan);
    },
    []
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [loadedProfile, loadedHistory, loadedTrainingState, loadedSettings, loadedActive] = await Promise.all([
          AthleteRepository.load(),
          WorkoutRepository.loadHistory(),
          TrainingStateRepository.load(),
          SettingsRepository.load(),
          WorkoutRepository.loadActiveWorkout(),
        ]);
        if (cancelled) return;
        setProfile(loadedProfile);
        setHistory(loadedHistory);
        setTrainingState(loadedTrainingState);
        setSettings(loadedSettings);
        setActiveWorkoutState(loadedActive);
        if (!loadedActive) {
          refreshPlan(0, loadedProfile, loadedTrainingState, loadedHistory);
        }
        setLoading(false);
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : 'Could not read your saved data.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshPlan, loadAttempt]);

  const regeneratePlan = useCallback(() => {
    if (!profile || !trainingState) return;
    const nextSeed = variantSeed + 1;
    setVariantSeed(nextSeed);
    refreshPlan(nextSeed, profile, trainingState, history);
  }, [profile, trainingState, history, variantSeed, refreshPlan]);

  const startWorkout = useCallback(() => {
    if (!currentPlan || !trainingState) return;
    const session = buildSessionFromGeneratedWorkout(currentPlan, trainingState.currentWorkoutNumber);
    setActiveWorkout(session);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [currentPlan, trainingState, setActiveWorkout]);

  const mutateActiveExercise = useCallback(
    (exerciseId: string, mutator: (ex: WorkoutExercise) => WorkoutExercise) => {
      setActiveWorkoutState((prev) => {
        if (!prev) return prev;
        const next = {
          ...prev,
          exercises: prev.exercises.map((ex) => (ex.exerciseId === exerciseId ? mutator(ex) : ex)),
        };
        void WorkoutRepository.saveActiveWorkout(next);
        return next;
      });
    },
    []
  );

  const updateSetLog = useCallback(
    (exerciseId: string, setNumber: number, patch: Partial<SetLog>) => {
      mutateActiveExercise(exerciseId, (ex) => ({
        ...ex,
        sets: ex.sets.map((s) => (s.setNumber === setNumber ? { ...s, ...patch } : s)),
      }));
    },
    [mutateActiveExercise]
  );

  const toggleSetCompleted = useCallback(
    (exerciseId: string, setNumber: number) => {
      mutateActiveExercise(exerciseId, (ex) => ({
        ...ex,
        sets: ex.sets.map((s) => (s.setNumber === setNumber ? { ...s, completed: !s.completed } : s)),
      }));
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    [mutateActiveExercise]
  );

  const addSet = useCallback(
    (exerciseId: string) => {
      mutateActiveExercise(exerciseId, (ex) => {
        const last = ex.sets[ex.sets.length - 1];
        const newSet: SetLog = {
          setNumber: ex.sets.length + 1,
          weight: last?.weight ?? ex.recommendedLoad,
          reps: last?.reps ?? ex.targetRepMax,
          completed: false,
          createdAt: new Date().toISOString(),
        };
        return { ...ex, sets: [...ex.sets, newSet], targetSets: ex.targetSets + 1 };
      });
    },
    [mutateActiveExercise]
  );

  const removeSet = useCallback(
    (exerciseId: string, setNumber: number) => {
      mutateActiveExercise(exerciseId, (ex) => {
        if (ex.sets.length <= 1) return ex;
        const remaining = ex.sets
          .filter((s) => s.setNumber !== setNumber)
          .map((s, i) => ({ ...s, setNumber: i + 1 }));
        return { ...ex, sets: remaining, targetSets: Math.max(1, ex.targetSets - 1) };
      });
    },
    [mutateActiveExercise]
  );

  const updateRecommendedLoad = useCallback(
    (exerciseId: string, load: number) => {
      mutateActiveExercise(exerciseId, (ex) => ({ ...ex, recommendedLoad: load }));
    },
    [mutateActiveExercise]
  );

  const skipExercise = useCallback(
    (exerciseId: string) => {
      mutateActiveExercise(exerciseId, (ex) => ({ ...ex, skipped: !ex.skipped }));
    },
    [mutateActiveExercise]
  );

  const substituteExercise = useCallback(
    (exerciseId: string) => {
      setActiveWorkoutState((prev) => {
        if (!prev) return prev;
        const next = {
          ...prev,
          exercises: applyStructuralAdaptation(prev.exercises, EXERCISE_LIBRARY, {
            type: 'SUBSTITUTE_EXERCISE',
            label: 'Manual substitution',
            exerciseId,
          }),
        };
        void WorkoutRepository.saveActiveWorkout(next);
        return next;
      });
    },
    []
  );

  const applyCoachAdaptation = useCallback(
    (adaptation: WorkoutAdaptation) => {
      if (adaptation.type === 'FLAG_LIMITATION' && adaptation.limitationArea) {
        setProfile((prevProfile) => {
          if (!prevProfile) return prevProfile;
          const existing = prevProfile.limitations.find((l) => l.area === adaptation.limitationArea);
          const nextLimitations: AthleteLimitation[] = existing
            ? prevProfile.limitations.map((l) =>
                l.area === adaptation.limitationArea ? { ...l, active: true, conservativeMode: true } : l
              )
            : [...prevProfile.limitations, { area: adaptation.limitationArea!, active: true, conservativeMode: true }];
          const nextProfile = { ...prevProfile, limitations: nextLimitations };
          void AthleteRepository.save(nextProfile);
          return nextProfile;
        });
        setTrainingState((prevState) => {
          if (!prevState) return prevState;
          const active = new Set(prevState.activeLimitations);
          active.add(adaptation.limitationArea!);
          const nextState = { ...prevState, activeLimitations: Array.from(active) };
          void TrainingStateRepository.save(nextState);
          return nextState;
        });
        return;
      }

      const target = activeWorkout ?? currentPlan;
      if (!target) return;
      const nextExercises = applyStructuralAdaptation(target.exercises, EXERCISE_LIBRARY, adaptation);
      const metaPatch = computeAdaptationMetaPatch(adaptation, {
        targetRPE: target.targetRPE,
        estimatedDurationMinutes:
          'estimatedDurationMinutes' in target ? target.estimatedDurationMinutes : undefined,
        cardioMinutes: 'cardioMinutes' in target ? target.cardioMinutes : undefined,
      });

      if (activeWorkout) {
        const next: WorkoutSession = {
          ...activeWorkout,
          exercises: nextExercises,
          targetRPE: metaPatch.targetRPE ?? activeWorkout.targetRPE,
          estimatedDurationMinutes: metaPatch.estimatedDurationMinutes ?? activeWorkout.estimatedDurationMinutes,
        };
        setActiveWorkoutState(next);
        void WorkoutRepository.saveActiveWorkout(next);
      } else if (currentPlan) {
        setCurrentPlan({
          ...currentPlan,
          exercises: nextExercises,
          targetRPE: metaPatch.targetRPE ?? currentPlan.targetRPE,
          estimatedDurationMinutes: metaPatch.estimatedDurationMinutes ?? currentPlan.estimatedDurationMinutes,
          cardioMinutes: metaPatch.cardioMinutes ?? currentPlan.cardioMinutes,
        });
      }
    },
    [activeWorkout, currentPlan]
  );

  const sendCoachMessage = useCallback(
    async (text: string): Promise<CoachResponse> => {
      if (!profile || !trainingState) {
        return { message: 'Training context is still loading.' };
      }
      return coachProvider.sendMessage(text, {
        profile,
        trainingState,
        activeWorkout,
        currentPlan,
        history,
      });
    },
    [profile, trainingState, activeWorkout, currentPlan, history]
  );

  const finishWorkout = useCallback(
    async (feedback: SessionFeedback) => {
      if (!activeWorkout || !profile || !trainingState) return;

      const nextProgression = applySessionProgression(
        trainingState.exerciseProgression,
        activeWorkout.exercises,
        EXERCISE_LIBRARY,
        feedback.sessionRPE,
        new Date().toISOString()
      );

      const completedSession: WorkoutSession = {
        ...activeWorkout,
        status: 'COMPLETED',
        completedAt: new Date().toISOString(),
        feedback,
      };

      const nextHistory = await WorkoutRepository.appendCompletedSession(completedSession);

      const painWorsened = feedback.limitationAfter - feedback.limitationBefore >= 2 || feedback.limitationAfter >= 6;
      const derivedFromProfile = deriveActiveLimitations(profile.limitations);
      const autoFlagged = painWorsened ? derivedFromProfile : [];
      const nextActiveLimitations = Array.from(new Set([...derivedFromProfile, ...autoFlagged]));

      const nextTrainingState: TrainingState = {
        lastWorkoutId: completedSession.id,
        lastModality: completedSession.modality,
        nextModality: getNextModality(completedSession.modality, profile.rotationSequence),
        sessionsCompleted: trainingState.sessionsCompleted + 1,
        lastCardioMinutes: feedback.cardioMinutes,
        recentSessionRPE: [...trainingState.recentSessionRPE, feedback.sessionRPE].slice(-5),
        exerciseProgression: nextProgression,
        activeLimitations: nextActiveLimitations,
        currentWorkoutNumber: trainingState.currentWorkoutNumber + 1,
        updatedAt: new Date().toISOString(),
      };

      await TrainingStateRepository.save(nextTrainingState);

      setHistory(nextHistory);
      setTrainingState(nextTrainingState);
      setActiveWorkout(null);
      refreshPlan(0, profile, nextTrainingState, nextHistory);
      setVariantSeed(0);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    [activeWorkout, profile, trainingState, setActiveWorkout, refreshPlan]
  );

  const updateProfile = useCallback(
    async (patch: Partial<AthleteProfile>) => {
      if (!profile || !trainingState) return;
      const nextProfile: AthleteProfile = { ...profile, ...patch, updatedAt: new Date().toISOString() };
      await AthleteRepository.save(nextProfile);
      setProfile(nextProfile);

      if (patch.limitations) {
        const nextTrainingState = { ...trainingState, activeLimitations: deriveActiveLimitations(patch.limitations) };
        await TrainingStateRepository.save(nextTrainingState);
        setTrainingState(nextTrainingState);
        if (!activeWorkout) refreshPlan(variantSeed, nextProfile, nextTrainingState, history);
      } else if (!activeWorkout) {
        refreshPlan(variantSeed, nextProfile, trainingState, history);
      }
    },
    [profile, trainingState, activeWorkout, history, variantSeed, refreshPlan]
  );

  const resetDemoData = useCallback(async () => {
    const [resetProfile, resetHistory, resetTrainingState] = await Promise.all([
      AthleteRepository.reset(),
      WorkoutRepository.reset(),
      TrainingStateRepository.reset(),
    ]);
    setProfile(resetProfile);
    setHistory(resetHistory);
    setTrainingState(resetTrainingState);
    setActiveWorkoutState(null);
    setVariantSeed(0);
    refreshPlan(0, resetProfile, resetTrainingState, resetHistory);
  }, [refreshPlan]);

  const completeOnboarding = useCallback(async () => {
    const next = await SettingsRepository.setOnboardingComplete(true);
    setSettings(next);
  }, []);

  const value = useMemo<AppStateValue | null>(() => {
    if (!profile || !trainingState || !settings) return null;
    return {
      loading,
      profile,
      history,
      trainingState,
      settings,
      activeWorkout,
      currentPlan,
      startWorkout,
      regeneratePlan,
      updateSetLog,
      toggleSetCompleted,
      addSet,
      removeSet,
      updateRecommendedLoad,
      skipExercise,
      substituteExercise,
      finishWorkout,
      applyCoachAdaptation,
      sendCoachMessage,
      updateProfile,
      resetDemoData,
      completeOnboarding,
    };
  }, [
    loading,
    profile,
    history,
    trainingState,
    settings,
    activeWorkout,
    currentPlan,
    startWorkout,
    regeneratePlan,
    updateSetLog,
    toggleSetCompleted,
    addSet,
    removeSet,
    updateRecommendedLoad,
    skipExercise,
    substituteExercise,
    finishWorkout,
    applyCoachAdaptation,
    sendCoachMessage,
    updateProfile,
    resetDemoData,
    completeOnboarding,
  ]);

  if (!value) {
    // Screens never mount before the provider is ready, so useAppState()
    // is never called with a null context.
    if (loadError) {
      return (
        <View style={styles.loadingRoot}>
          <Text style={styles.errorTitle} accessibilityRole="header">
            Could not read your saved data
          </Text>
          <Text style={styles.errorBody}>
            Nothing has been changed or replaced. Close other copies of the app, then try again.
          </Text>
          <Pressable
            onPress={() => {
              setLoadError(null);
              setLoadAttempt((n) => n + 1);
            }}
            accessibilityRole="button"
            accessibilityLabel="Try loading your saved data again"
            style={styles.retryButton}
          >
            <Text style={styles.retryLabel}>Try again</Text>
          </Pressable>
        </View>
      );
    }
    return (
      <View style={styles.loadingRoot}>
        <ActivityIndicator color={colors.accentSoft} />
        <Text style={styles.loadingLabel}>VYNKÆR</Text>
      </View>
    );
  }

  return <AppStateCtx.Provider value={value}>{children}</AppStateCtx.Provider>;
}

export function useAppState(): AppStateValue {
  const ctx = useContext(AppStateCtx);
  if (!ctx) {
    throw new Error('useAppState must be used within AppStateProvider, after initial load completes');
  }
  return ctx;
}

const styles = StyleSheet.create({
  loadingRoot: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingLabel: {
    ...typography.microLabel,
    color: colors.textSecondary,
    marginTop: 4,
  },
  errorTitle: {
    ...typography.h2,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  errorBody: {
    ...typography.bodyMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.xxl,
  },
  retryButton: {
    minHeight: 48,
    minWidth: 160,
    marginTop: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
  },
  retryLabel: {
    ...typography.body,
    fontWeight: '700',
    color: colors.onAccent,
  },
});
