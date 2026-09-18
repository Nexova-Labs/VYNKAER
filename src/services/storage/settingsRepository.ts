import type { AppSettings } from '../../types';
import { readJSON, writeJSON, StorageKeys } from './storage';

const DEFAULT_SETTINGS: AppSettings = {
  onboardingComplete: false,
  hapticsEnabled: true,
};

export const SettingsRepository = {
  async load(): Promise<AppSettings> {
    const stored = await readJSON<AppSettings>(StorageKeys.settings);
    if (stored && typeof stored.onboardingComplete === 'boolean') {
      return { ...DEFAULT_SETTINGS, ...stored };
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
