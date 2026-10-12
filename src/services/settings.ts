import { FillOptions, FillScript, ProfileType, SyntheticPerson } from '../types';
import { generateSyntheticPerson } from '../generator/personGenerator';
import { generatePersonFromPreset, getPersonaPresets } from './personaPresets';

export type FillCategories = FillOptions['fillCategories'];

export const DEFAULT_FILL_CATEGORIES: FillCategories = {
  personal: true,
  contact: true,
  address: true,
  professional: true,
};

export const PROFILE_TYPES: readonly ProfileType[] = ['general', 'student', 'employee', 'business', 'teacher', 'farmer'];

export interface FillSettings {
  profile: ProfileType;
  presetId: string | null;
  fillScript: FillScript;
  fillCategories: FillCategories;
  aiEnabled: boolean;
}

const SETTINGS_KEYS = [
  'selectedProfile',
  'selectedPresetId',
  'fillScript',
  'fillCategories',
  'geminiAiClassificationEnabled',
  'aiEnabled',
] as const;

function hasStorage(): boolean {
  return typeof chrome !== 'undefined' && Boolean(chrome.storage?.local);
}

/**
 * Reads the user's fill preferences with defaults. `aiEnabled` is the legacy key
 * older builds wrote from the options page; `geminiAiClassificationEnabled` wins.
 */
export async function loadFillSettings(): Promise<FillSettings> {
  const data = hasStorage() ? ((await chrome.storage.local.get([...SETTINGS_KEYS])) as Record<string, unknown>) : {};

  const profile = PROFILE_TYPES.includes(data.selectedProfile as ProfileType)
    ? (data.selectedProfile as ProfileType)
    : 'general';
  const aiFlag = data.geminiAiClassificationEnabled ?? data.aiEnabled;

  return {
    profile,
    presetId: typeof data.selectedPresetId === 'string' && data.selectedPresetId ? data.selectedPresetId : null,
    fillScript: data.fillScript === 'np' ? 'np' : 'en',
    fillCategories: { ...DEFAULT_FILL_CATEGORIES, ...((data.fillCategories as Partial<FillCategories>) || {}) },
    aiEnabled: aiFlag === true,
  };
}

export async function saveSettings(values: Record<string, unknown>): Promise<void> {
  if (hasStorage()) await chrome.storage.local.set(values);
}

/** Generates a fresh person for the active preset (if it still exists) or archetype. */
export async function generatePersonForSettings(settings: FillSettings): Promise<SyntheticPerson> {
  if (settings.presetId) {
    const preset = (await getPersonaPresets()).find((p) => p.id === settings.presetId);
    if (preset) return generatePersonFromPreset(preset);
  }
  return generateSyntheticPerson(settings.profile);
}

/**
 * The persona currently shown in the popup. Shared so that keyboard shortcuts and the
 * in-page badge fill the same person the user is looking at.
 */
export async function loadCurrentPerson(): Promise<SyntheticPerson | null> {
  if (!hasStorage()) return null;
  const { lastGeneratedPerson } = (await chrome.storage.local.get(['lastGeneratedPerson'])) as Record<string, unknown>;
  const p = lastGeneratedPerson as SyntheticPerson | undefined;
  return p && typeof p.fullName === 'string' && p.address ? p : null;
}

export async function saveCurrentPerson(person: SyntheticPerson): Promise<void> {
  await saveSettings({ lastGeneratedPerson: person });
}

export function toFillOptions(settings: FillSettings): FillOptions {
  return {
    profile: settings.profile,
    fillScript: settings.fillScript,
    fillCategories: settings.fillCategories,
    enableAiClassification: settings.aiEnabled,
  };
}
