import { SEED_ATHLETE_PROFILE } from '../../../data/seed';
import type { WorkoutAdaptation } from '../../../types';
import {
  OPENING_MESSAGE,
  QUICK_ACTIONS,
  buildAdaptationDiff,
  coachMessage,
  resolveProposal,
  userMessage,
} from '../conversation';

const SHORTEN: WorkoutAdaptation = { type: 'SHORTEN_DURATION', label: 'Shorten today to 40 minutes', targetDurationMinutes: 40 };
const NOW = '2026-11-04T10:00:00.000Z';

function thread() {
  return [
    OPENING_MESSAGE,
    userMessage('u1', 'I only have 40 minutes', NOW),
    coachMessage('c1', 'Trim the accessories.', NOW, SHORTEN),
    coachMessage('c2', 'Just a note, no proposal.', NOW),
  ];
}

describe('a Coach proposal never changes anything until it is applied', () => {
  it('a new proposal starts pending and hands nothing back', () => {
    const messages = thread();
    expect(messages.find((m) => m.id === 'c1')!.status).toBeUndefined();
  });

  it('applying a pending proposal returns the adaptation exactly once and marks it applied', () => {
    const first = resolveProposal(thread(), 'c1', 'applied');
    expect(first.adaptation).toEqual(SHORTEN);
    expect(first.messages.find((m) => m.id === 'c1')!.status).toBe('applied');

    const second = resolveProposal(first.messages, 'c1', 'applied');
    expect(second.adaptation).toBeNull();
    expect(second.messages).toBe(first.messages);
  });

  it('dismissing never returns an adaptation, and a dismissed proposal cannot be applied later', () => {
    const dismissed = resolveProposal(thread(), 'c1', 'dismissed');
    expect(dismissed.adaptation).toBeNull();
    expect(dismissed.messages.find((m) => m.id === 'c1')!.status).toBe('dismissed');

    const afterwards = resolveProposal(dismissed.messages, 'c1', 'applied');
    expect(afterwards.adaptation).toBeNull();
    expect(afterwards.messages).toBe(dismissed.messages);
  });

  it('ignores ids that are unknown or that carry no proposal', () => {
    const messages = thread();
    expect(resolveProposal(messages, 'nope', 'applied')).toEqual({ messages, adaptation: null });
    expect(resolveProposal(messages, 'c2', 'applied')).toEqual({ messages, adaptation: null });
    expect(resolveProposal(messages, 'u1', 'applied')).toEqual({ messages, adaptation: null });
  });

  it('does not mutate the previous transcript', () => {
    const messages = thread();
    resolveProposal(messages, 'c1', 'applied');
    expect(messages.find((m) => m.id === 'c1')!.status).toBeUndefined();
  });
});

describe('quick actions', () => {
  it('are capped at four', () => {
    expect(QUICK_ACTIONS.length).toBeLessThanOrEqual(4);
  });
});

describe('buildAdaptationDiff', () => {
  it('compares durations using the plan, falling back to the athlete preference', () => {
    expect(buildAdaptationDiff(SHORTEN, null, SEED_ATHLETE_PROFILE)).toEqual({
      current: `${SEED_ATHLETE_PROFILE.preferredDurationMinutes} min session`,
      proposed: '40 min session',
    });
  });

  it('does not fabricate a comparison for adaptations without a clean numeric diff', () => {
    expect(buildAdaptationDiff({ type: 'EASIER', label: 'Easier' }, null, SEED_ATHLETE_PROFILE)).toBeNull();
  });
});
