import { FillOptions, SyntheticPerson } from '../types';

export const SESSION_PERSONA_KEY = '__nepal_filler_session_persona__';
export const SESSION_OPTIONS_KEY = '__nepal_filler_session_options__';

let isSessionPersistenceActive = true;

// In-memory fallback in case DOM sessionStorage is inaccessible or throws SecurityError
let inMemorySessionPersona: SyntheticPerson | null = null;
let inMemorySessionOptions: FillOptions | null = null;

export function setSessionPersistenceEnabled(enabled: boolean): void {
  isSessionPersistenceActive = enabled;
  if (!enabled) {
    clearSessionPersona();
  }
}

export function isSessionPersistenceEnabled(): boolean {
  return isSessionPersistenceActive;
}

/**
 * Safely resolves the window.sessionStorage object.
 */
function getSafeSessionStorage(customStorage?: Storage): Storage | null {
  if (customStorage) return customStorage;
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      // Test read/write in case of sandbox restrictions or quota limits
      const testKey = '__nepal_filler_storage_test__';
      window.sessionStorage.setItem(testKey, '1');
      window.sessionStorage.removeItem(testKey);
      return window.sessionStorage;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Validates that an object is a plausible SyntheticPerson.
 */
function isValidSyntheticPerson(data: unknown): data is SyntheticPerson {
  if (!data || typeof data !== 'object') return false;
  const p = data as Record<string, any>;
  return (
    typeof p.fullName === 'string' &&
    p.fullName.trim().length > 0 &&
    typeof p.gender === 'string' &&
    typeof p.phone === 'string' &&
    typeof p.address === 'object' &&
    p.address !== null
  );
}

/**
 * Retrieves the currently retained synthetic person for this tab session.
 */
export function getSessionPersona(storage?: Storage): SyntheticPerson | null {
  if (!isSessionPersistenceActive) return null;

  const sess = getSafeSessionStorage(storage);
  if (sess) {
    try {
      const raw = sess.getItem(SESSION_PERSONA_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (isValidSyntheticPerson(parsed)) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('[Nepal Test Filler] Failed to read session persona:', err);
    }
  }
  return inMemorySessionPersona;
}

/**
 * Saves the active synthetic person into this tab's sessionStorage.
 */
export function setSessionPersona(person: SyntheticPerson, storage?: Storage): boolean {
  if (!isSessionPersistenceActive) return false;
  if (!isValidSyntheticPerson(person)) return false;

  inMemorySessionPersona = person;
  const sess = getSafeSessionStorage(storage);
  if (sess) {
    try {
      sess.setItem(SESSION_PERSONA_KEY, JSON.stringify(person));
      return true;
    } catch (err) {
      console.warn('[Nepal Test Filler] Failed to write session persona:', err);
    }
  }
  return inMemorySessionPersona !== null;
}

/**
 * Clears the retained synthetic person from this tab's sessionStorage.
 */
export function clearSessionPersona(storage?: Storage): boolean {
  inMemorySessionPersona = null;
  const sess = getSafeSessionStorage(storage);
  if (sess) {
    try {
      sess.removeItem(SESSION_PERSONA_KEY);
      return true;
    } catch (err) {
      console.warn('[Nepal Test Filler] Failed to clear session persona:', err);
    }
  }
  return true;
}

/**
 * Checks whether this tab currently has a retained synthetic person.
 */
export function hasSessionPersona(storage?: Storage): boolean {
  return getSessionPersona(storage) !== null;
}

/**
 * Retrieves the currently retained fill options for this tab session.
 */
export function getSessionOptions(storage?: Storage): FillOptions | null {
  const sess = getSafeSessionStorage(storage);
  if (sess) {
    try {
      const raw = sess.getItem(SESSION_OPTIONS_KEY);
      if (raw) {
        return JSON.parse(raw) as FillOptions;
      }
    } catch {
      // ignore
    }
  }
  return inMemorySessionOptions;
}

/**
 * Saves the active fill options into this tab's sessionStorage.
 */
export function setSessionOptions(options: FillOptions, storage?: Storage): boolean {
  inMemorySessionOptions = options;
  const sess = getSafeSessionStorage(storage);
  if (sess) {
    try {
      sess.setItem(SESSION_OPTIONS_KEY, JSON.stringify(options));
      return true;
    } catch {
      // ignore
    }
  }
  return inMemorySessionOptions !== null;
}
