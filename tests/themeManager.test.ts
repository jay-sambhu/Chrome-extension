import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getResolvedTheme,
  applyThemeToDocument,
  loadThemePreference,
  saveThemePreference,
  setupSystemThemeListener,
} from '../src/utils/themeManager';

describe('Phase 4.3 Light / Dark Theme Toggle Engine', () => {
  let fakeStorage: Record<string, any> = {};

  beforeEach(() => {
    fakeStorage = {};

    // Mock chrome.storage.local
    (globalThis as any).chrome = {
      storage: {
        local: {
          get: vi.fn(async (keys: string[]) => {
            const result: Record<string, any> = {};
            for (const key of keys) {
              if (fakeStorage[key] !== undefined) {
                result[key] = fakeStorage[key];
              }
            }
            return result;
          }),
          set: vi.fn(async (items: Record<string, any>) => {
            Object.assign(fakeStorage, items);
          }),
        },
      },
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getResolvedTheme', () => {
    it('returns "light" when preference is explicitly "light"', () => {
      expect(getResolvedTheme('light')).toBe('light');
      expect(getResolvedTheme('light', false)).toBe('light');
    });

    it('returns "dark" when preference is explicitly "dark"', () => {
      expect(getResolvedTheme('dark')).toBe('dark');
      expect(getResolvedTheme('dark', true)).toBe('dark');
    });

    it('resolves system theme according to systemPrefersLight parameter', () => {
      expect(getResolvedTheme('system', true)).toBe('light');
      expect(getResolvedTheme('system', false)).toBe('dark');
    });

    it('uses window.matchMedia when systemPrefersLight is undefined', () => {
      const originalMatchMedia = window.matchMedia;

      // Mock prefers-color-scheme: light is true
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-color-scheme: light)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));

      expect(getResolvedTheme('system')).toBe('light');

      // Mock prefers-color-scheme: light is false
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));

      expect(getResolvedTheme('system')).toBe('dark');

      window.matchMedia = originalMatchMedia;
    });

    it('falls back to "dark" if window.matchMedia is unavailable', () => {
      const originalMatchMedia = window.matchMedia;
      delete (window as any).matchMedia;

      expect(getResolvedTheme('system')).toBe('dark');

      window.matchMedia = originalMatchMedia;
    });
  });

  describe('applyThemeToDocument', () => {
    it('sets data-theme and data-theme-preference on document.documentElement', () => {
      const resolved = applyThemeToDocument('light');
      expect(resolved).toBe('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      expect(document.documentElement.getAttribute('data-theme-preference')).toBe('light');

      const resolvedDark = applyThemeToDocument('dark');
      expect(resolvedDark).toBe('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      expect(document.documentElement.getAttribute('data-theme-preference')).toBe('dark');
    });

    it('correctly sets data-theme to resolved system value and preference to system', () => {
      const resolved = applyThemeToDocument('system', true);
      expect(resolved).toBe('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      expect(document.documentElement.getAttribute('data-theme-preference')).toBe('system');

      const resolvedDark = applyThemeToDocument('system', false);
      expect(resolvedDark).toBe('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      expect(document.documentElement.getAttribute('data-theme-preference')).toBe('system');
    });
  });

  describe('loadThemePreference and saveThemePreference', () => {
    it('defaults to "system" when no preference is saved', async () => {
      const theme = await loadThemePreference();
      expect(theme).toBe('system');
    });

    it('saves and loads preference properly', async () => {
      await saveThemePreference('light');
      expect(fakeStorage['theme']).toBe('light');

      const loaded = await loadThemePreference();
      expect(loaded).toBe('light');

      await saveThemePreference('dark');
      expect(await loadThemePreference()).toBe('dark');

      await saveThemePreference('system');
      expect(await loadThemePreference()).toBe('system');
    });

    it('falls back to "system" if stored value is invalid or chrome is undefined', async () => {
      fakeStorage['theme'] = 'invalid_theme';
      expect(await loadThemePreference()).toBe('system');

      const originalChrome = (globalThis as any).chrome;
      delete (globalThis as any).chrome;

      expect(await loadThemePreference()).toBe('system');
      await expect(saveThemePreference('dark')).resolves.not.toThrow();

      (globalThis as any).chrome = originalChrome;
    });
  });

  describe('setupSystemThemeListener', () => {
    it('registers change listener on prefers-color-scheme media query and cleans up', () => {
      let registeredListener: ((e: any) => void) | null = null;
      const removeEventListenerMock = vi.fn();

      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn((event: string, cb: any) => {
          if (event === 'change') registeredListener = cb;
        }),
        removeEventListener: removeEventListenerMock,
      }));

      const callback = vi.fn();
      const cleanup = setupSystemThemeListener(callback);

      expect(registeredListener).toBeDefined();

      // Simulate system switching to light mode
      registeredListener!({ matches: true });
      expect(callback).toHaveBeenCalledWith('light');

      // Simulate system switching to dark mode
      registeredListener!({ matches: false });
      expect(callback).toHaveBeenCalledWith('dark');

      cleanup();
      expect(removeEventListenerMock).toHaveBeenCalledWith('change', registeredListener);
    });

    it('falls back gracefully if addEventListener is not present (legacy addListener)', () => {
      let registeredListener: ((e: any) => void) | null = null;
      const removeListenerMock = vi.fn();

      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addListener: vi.fn((cb: any) => {
          registeredListener = cb;
        }),
        removeListener: removeListenerMock,
      }));

      const callback = vi.fn();
      const cleanup = setupSystemThemeListener(callback);

      expect(registeredListener).toBeDefined();
      registeredListener!({ matches: true });
      expect(callback).toHaveBeenCalledWith('light');

      cleanup();
      expect(removeListenerMock).toHaveBeenCalledWith(registeredListener);
    });

    it('returns a no-op if window.matchMedia is unavailable', () => {
      const originalMatchMedia = window.matchMedia;
      delete (window as any).matchMedia;

      const callback = vi.fn();
      const cleanup = setupSystemThemeListener(callback);
      expect(typeof cleanup).toBe('function');
      cleanup();
      expect(callback).not.toHaveBeenCalled();

      window.matchMedia = originalMatchMedia;
    });
  });
});
