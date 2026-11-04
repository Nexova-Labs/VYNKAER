import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { useAppState } from '../../state';
import { OPENING_MESSAGE, coachMessage, resolveProposal, userMessage, type TranscriptMessage } from './conversation';

interface CoachConversationValue {
  transcript: TranscriptMessage[];
  pending: boolean;
  send: (text: string) => Promise<void>;
  /** The only path that changes a plan: the athlete explicitly approves one pending proposal. */
  apply: (id: string) => void;
  dismiss: (id: string) => void;
}

const Ctx = createContext<CoachConversationValue | null>(null);

let counter = 0;
function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}-${Date.now()}-${counter}`;
}

// One in-memory conversation shared by the embedded Today card and the Coach modal, so a thread
// started on Today is still there when the modal is opened from another tab. Not persisted (a
// documented V1 decision); mounted inside AppStateProvider.
export function CoachConversationProvider({ children }: { children: React.ReactNode }) {
  const { sendCoachMessage, applyCoachAdaptation } = useAppState();
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([OPENING_MESSAGE]);
  const [pending, setPending] = useState(false);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || pending) return;
      setTranscript((prev) => [...prev, userMessage(nextId('user'), trimmed, new Date().toISOString())]);
      setPending(true);
      try {
        const response = await sendCoachMessage(trimmed);
        setTranscript((prev) => [
          ...prev,
          coachMessage(nextId('coach'), response.message, new Date().toISOString(), response.proposedAdaptation),
        ]);
      } catch {
        setTranscript((prev) => [
          ...prev,
          coachMessage(nextId('coach'), 'That did not go through. Try again.', new Date().toISOString()),
        ]);
      } finally {
        setPending(false);
      }
    },
    [pending, sendCoachMessage],
  );

  const apply = useCallback(
    (id: string) => {
      const result = resolveProposal(transcript, id, 'applied');
      if (!result.adaptation) return;
      applyCoachAdaptation(result.adaptation);
      setTranscript(result.messages);
    },
    [transcript, applyCoachAdaptation],
  );

  const dismiss = useCallback(
    (id: string) => {
      setTranscript(resolveProposal(transcript, id, 'dismissed').messages);
    },
    [transcript],
  );

  const value = useMemo(() => ({ transcript, pending, send, apply, dismiss }), [transcript, pending, send, apply, dismiss]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCoachConversation(): CoachConversationValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCoachConversation must be used within CoachConversationProvider');
  return ctx;
}
