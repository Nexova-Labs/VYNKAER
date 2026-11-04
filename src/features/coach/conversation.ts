import type { AthleteProfile, CoachMessage, GeneratedWorkout, WorkoutAdaptation } from '../../types';

// Pure logic for the Coach conversation. The conversation is a live layer, not persisted domain
// state. The one rule that matters lives here: a proposed adaptation is inert until the athlete
// resolves it, and only an explicit "applied" resolution ever hands an adaptation back to be applied.

export type ProposalStatus = 'applied' | 'dismissed';

export interface TranscriptMessage extends CoachMessage {
  /** Only meaningful when `adaptation` is set. Undefined means still pending (nothing has changed). */
  status?: ProposalStatus;
}

// Phrases chosen to match DemoCoachProvider's keyword routing so each chip yields a real proposal.
// Capped at four (working-memory limit); anything else can still be typed.
export const QUICK_ACTIONS = [
  'I only have 40 minutes',
  'My shoulders feel tired',
  'I want more cardio',
  'Something hurts',
] as const;

export const OPENING_MESSAGE: TranscriptMessage = {
  id: 'coach-opening',
  role: 'coach',
  text: 'I have your training history, progression state, modality rotation and current session context. What needs changing?',
  createdAt: new Date(0).toISOString(),
};

export function userMessage(id: string, text: string, createdAt: string): TranscriptMessage {
  return { id, role: 'user', text, createdAt };
}

/** A coach reply. A proposal always starts pending: building a message never applies anything. */
export function coachMessage(
  id: string,
  text: string,
  createdAt: string,
  adaptation?: WorkoutAdaptation,
): TranscriptMessage {
  return { id, role: 'coach', text, adaptation, createdAt };
}

/**
 * Resolves a pending proposal. Returns the new transcript and, ONLY when a pending proposal is
 * being applied, the adaptation the caller must now apply. Dismissing, re-applying, applying a
 * dismissed proposal, or an unknown id all return `adaptation: null` and the transcript unchanged
 * (same reference when nothing changed).
 */
export function resolveProposal(
  messages: TranscriptMessage[],
  id: string,
  status: ProposalStatus,
): { messages: TranscriptMessage[]; adaptation: WorkoutAdaptation | null } {
  const index = messages.findIndex((m) => m.id === id && m.adaptation && !m.status);
  if (index === -1) return { messages, adaptation: null };

  const target = messages[index];
  const next = messages.slice();
  next[index] = { ...target, status };
  return { messages: next, adaptation: status === 'applied' ? (target.adaptation ?? null) : null };
}

// Only build a before/after diff where the adaptation carries a clean numeric comparison.
// Everything else falls back to just the label, rather than fabricating a "current" value that
// is not backed by real state.
export function buildAdaptationDiff(
  adaptation: WorkoutAdaptation,
  currentPlan: GeneratedWorkout | null,
  profile: AthleteProfile,
): { current: string; proposed: string } | null {
  if (adaptation.type === 'SHORTEN_DURATION' && adaptation.targetDurationMinutes != null) {
    const currentMinutes = currentPlan?.estimatedDurationMinutes ?? profile.preferredDurationMinutes;
    return { current: `${currentMinutes} min session`, proposed: `${adaptation.targetDurationMinutes} min session` };
  }
  if (adaptation.type === 'INCREASE_CARDIO' && adaptation.cardioDeltaMinutes != null) {
    return { current: 'No change', proposed: `+${adaptation.cardioDeltaMinutes} min conditioning` };
  }
  return null;
}
