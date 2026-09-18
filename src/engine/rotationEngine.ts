// Modality rotation.
//
// VYNKÆR alternates training modality session to session so the athlete is not
// stuck on one equipment style. The rotation is fully deterministic: given the
// last modality (and an optional custom sequence) there is exactly one answer.

import type { Modality } from '../types';

export const DEFAULT_ROTATION_SEQUENCE: Modality[] = ['FREE_WEIGHT', 'MACHINE_CABLE', 'MIXED'];

const MODALITY_LABELS: Record<Modality, string> = {
  FREE_WEIGHT: 'Free Weight',
  MACHINE_CABLE: 'Machine/Cable',
  MIXED: 'Mixed',
};

/**
 * Returns the modality that should be trained next.
 *
 * FREE_WEIGHT -> MACHINE_CABLE -> MIXED -> FREE_WEIGHT ...
 * `null` (no history yet) -> the first entry of the sequence.
 * An unknown/never-used modality also falls back to the first entry.
 */
export function getNextModality(
  last: Modality | null,
  sequence: Modality[] = DEFAULT_ROTATION_SEQUENCE,
): Modality {
  const seq = sequence && sequence.length > 0 ? sequence : DEFAULT_ROTATION_SEQUENCE;

  if (!last) {
    return seq[0];
  }

  const index = seq.indexOf(last);
  if (index === -1) {
    return seq[0];
  }

  return seq[(index + 1) % seq.length];
}

/** Human-readable modality name for explanation lines and UI labels. */
export function describeModality(modality: Modality): string {
  return MODALITY_LABELS[modality];
}

/** The upcoming `count` modalities, useful for previewing the week ahead. */
export function getRotationPreview(
  last: Modality | null,
  count: number,
  sequence: Modality[] = DEFAULT_ROTATION_SEQUENCE,
): Modality[] {
  const preview: Modality[] = [];
  let cursor: Modality | null = last;

  for (let i = 0; i < Math.max(0, count); i += 1) {
    const next = getNextModality(cursor, sequence);
    preview.push(next);
    cursor = next;
  }

  return preview;
}

/** Explanation line describing why today's modality was chosen. */
export function explainModalityChoice(last: Modality | null, next: Modality): string {
  if (!last) {
    return `This is your first recorded session, so we start the rotation with ${describeModality(next)}.`;
  }
  return `Your previous session was ${describeModality(last)}, so today's modality advances to ${describeModality(next)}.`;
}
