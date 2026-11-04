import type { AppSettings } from '../../types';
import { quarantineRaw, readStored, writeJSON, StorageKeys } from './storage';

const DEFAULT_SETTINGS: AppSettings = {
  onboardingComplete: false,
  hapticsEnabled: true,
};

export const SettingsRepository = {
  async load(): Promise<AppSettings> {
    const stored = await readStored<AppSettings>(StorageKeys.settings);
    if (stored.kind === 'ok' && stored.value && typeof stored.value.onboardingComplete === 'boolean') {
      return { ...DEFAULT_SETTINGS, ...stored.value };
    }
    if (stored.kind !== 'missing') {
      await quarantineRaw(StorageKeys.settings, stored.raw);
      await writeJSON(StorageKeys.settings, DEFAULT_SETTINGS);
    }
    return DEFAULT_SETTINGS;
  },

  async save(settings: AppSettings): Promise<void> {
    await writeJSON(StorageKeys.settings, settings);
  },

  async setOnboardingComplete(complete: boolean): Promise<AppSettings> {
    const current = await this.load();
    const next = { ...current, onboardingComplete: complete };
    await this.save(next);
    return next;
  },
};
