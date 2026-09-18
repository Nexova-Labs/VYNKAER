import type { Modality } from '../../types';
import {
  DEFAULT_ROTATION_SEQUENCE,
  describeModality,
  explainModalityChoice,
  getNextModality,
  getRotationPreview,
} from '../rotationEngine';

describe('rotationEngine.getNextModality', () => {
  it('advances FREE_WEIGHT to MACHINE_CABLE', () => {
    expect(getNextModality('FREE_WEIGHT')).toBe('MACHINE_CABLE');
  });

  it('advances MACHINE_CABLE to MIXED', () => {
    expect(getNextModality('MACHINE_CABLE')).toBe('MIXED');
  });

  it('wraps MIXED back to FREE_WEIGHT', () => {
    expect(getNextModality('MIXED')).toBe('FREE_WEIGHT');
  });

  it('starts at the first entry of the sequence when there is no history', () => {
    expect(getNextModality(null)).toBe('FREE_WEIGHT');
    expect(getNextModality(null)).toBe(DEFAULT_ROTATION_SEQUENCE[0]);
  });

  it('cycles a full rotation deterministically', () => {
    let modality = getNextModality(null);
    const seen: Modality[] = [modality];
    for (let i = 0; i < 3; i += 1) {
      modality = getNextModality(modality);
      seen.push(modality);
    }
    expect(seen).toEqual(['FREE_WEIGHT', 'MACHINE_CABLE', 'MIXED', 'FREE_WEIGHT']);
  });

  it('supports a custom sequence from the athlete profile', () => {
    const custom: Modality[] = ['MIXED', 'FREE_WEIGHT'];
    expect(getNextModality(null, custom)).toBe('MIXED');
    expect(getNextModality('MIXED', custom)).toBe('FREE_WEIGHT');
    expect(getNextModality('FREE_WEIGHT', custom)).toBe('MIXED');
  });

  it('falls back to the first entry for a modality outside the sequence', () => {
    const custom: Modality[] = ['MIXED', 'FREE_WEIGHT'];
    expect(getNextModality('MACHINE_CABLE', custom)).toBe('MIXED');
  });

  it('falls back to the default sequence when an empty one is supplied', () => {
    expect(getNextModality('FREE_WEIGHT', [])).toBe('MACHINE_CABLE');
  });
});

describe('rotationEngine helpers', () => {
  it('previews upcoming modalities', () => {
    expect(getRotationPreview('FREE_WEIGHT', 3)).toEqual(['MACHINE_CABLE', 'MIXED', 'FREE_WEIGHT']);
  });

  it('labels modalities for the UI', () => {
    expect(describeModality('MACHINE_CABLE')).toBe('Machine/Cable');
  });

  it('explains the modality choice in plain English', () => {
    expect(explainModalityChoice('MACHINE_CABLE', 'MIXED')).toBe(
      "Your previous session was Machine/Cable, so today's modality advances to Mixed.",
    );
    expect(explainModalityChoice(null, 'FREE_WEIGHT')).toContain('first recorded session');
  });
});
