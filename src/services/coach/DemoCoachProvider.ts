import type { CoachContext, CoachProvider, CoachResponse, WorkoutAdaptation } from '../../types';
import { EXERCISE_LIBRARY } from '../../data/exercises';

function findLibraryExercise(id: string) {
  return EXERCISE_LIBRARY.find((e) => e.id === id);
}

function firstNonCardioExercise(context: CoachContext) {
  const source = context.activeWorkout?.exercises ?? context.currentPlan?.exercises ?? [];
  const candidate = source.find((ex) => {
    const def = findLibraryExercise(ex.exerciseId);
    return def && def.movementPattern !== 'CONDITIONING' && !ex.skipped;
  });
  return candidate ? findLibraryExercise(candidate.exerciseId) : undefined;
}

// Deterministic, keyword-driven Coach for V1. No network call, no LLM —
// it reasons over the athlete's actual current context so the UI layer
// can be built against a stable contract before a real Claude-backed
// provider exists (see docs/SUPABASE_MIGRATION.md and the Edge Function
// stub under supabase/functions/coach-proxy for the future path).
export class DemoCoachProvider implements CoachProvider {
  async sendMessage(message: string, context: CoachContext): Promise<CoachResponse> {
    const text = message.toLowerCase();

    if (/40\s*min|short on time|only have|limited time/.test(text)) {
      const adaptation: WorkoutAdaptation = {
        type: 'SHORTEN_DURATION',
        label: 'Shorten today to 40 minutes',
        targetDurationMinutes: 40,
      };
      return {
        message:
          'Keep the highest-value compound movements and trim optional accessory work. I would keep pressing, pulling and one carry, and shorten rest between sets slightly. Apply this to fit inside 40 minutes.',
        proposedAdaptation: adaptation,
      };
    }

    if (/shoulder/.test(text) && /(tired|sore|fatigue|beat up)/.test(text)) {
      const adaptation: WorkoutAdaptation = {
        type: 'REMOVE_MOVEMENT_PATTERN',
        label: 'Remove direct shoulder pressing today',
        movementPattern: 'VERTICAL_PUSH',
      };
      return {
        message:
          'I would remove direct shoulder pressing today and keep rows and pulldowns as planned. There is no need to force progression on a joint pattern that feels under-recovered — the rest of the session stays intact.',
        proposedAdaptation: adaptation,
      };
    }

    if (/cardio|conditioning|bike/.test(text) && /(more|increase|extra)/.test(text)) {
      const adaptation: WorkoutAdaptation = {
        type: 'INCREASE_CARDIO',
        label: 'Increase conditioning by 3 minutes',
        cardioDeltaMinutes: 3,
      };
      return {
        message:
          'I would add 3 minutes to the conditioning finisher rather than introducing new high-impact work. Strength sets stay unchanged, so conditioning increases without pulling focus from the 6–8 rep progression target.',
        proposedAdaptation: adaptation,
      };
    }

    if (/hurt|pain|ache|injur/.test(text)) {
      const area = /knee/.test(text) ? 'KNEE' : /shoulder/.test(text) ? 'SHOULDER' : /back/.test(text) ? 'LOWER_BACK' : 'OTHER';
      const adaptation: WorkoutAdaptation = {
        type: 'FLAG_LIMITATION',
        label: 'Flag this as an active limitation and select conservatively',
        limitationArea: area,
      };
      return {
        message:
          'Pain is the governing constraint. I would flag this area and switch to conservative exercise selection rather than pushing through it. If the pain is significant, worsening, or does not settle with rest, stop the aggravating movement and have it assessed by a qualified professional — this is not a diagnosis and VYNKÆR is not a medical device.',
        proposedAdaptation: adaptation,
      };
    }

    if (/(too easy|make.*easier|light)/.test(text)) {
      const adaptation: WorkoutAdaptation = { type: 'EASIER', label: 'Reduce load slightly for today' };
      return {
        message: 'I would drop the working loads by one increment across the main lifts for today only. This does not change your stored progression state — it resumes at the previous load next session.',
        proposedAdaptation: adaptation,
      };
    }

    if (/(too hard|harder|more challenging|push me)/.test(text)) {
      const adaptation: WorkoutAdaptation = { type: 'HARDER', label: 'Increase load slightly for today' };
      return {
        message: 'I would add one increment to the main lifts for today. This is a one-off bump for today’s session, not a permanent change to your progression state.',
        proposedAdaptation: adaptation,
      };
    }

    if (/substitut/.test(text)) {
      const target = firstNonCardioExercise(context);
      if (target) {
        const adaptation: WorkoutAdaptation = {
          type: 'SUBSTITUTE_EXERCISE',
          label: `Substitute ${target.name}`,
          exerciseId: target.id,
        };
        return {
          message: `I would substitute ${target.name} for a comparable movement pattern and start conservatively at the new exercise.`,
          proposedAdaptation: adaptation,
        };
      }
      return { message: 'Tell me which exercise you want substituted and I will propose an alternative that keeps the same movement pattern.' };
    }

    return {
      message:
        'For this V1 demo I reason over keywords and your current session context. I would preserve the rotation and progression rules first, then adapt exercise choice around your constraint. A production Coach could route this through a secure backend to Claude for deeper reasoning, still gated behind your explicit approval before anything changes.',
    };
  }
}
