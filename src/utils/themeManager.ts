export type ThemePreference = 'dark' | 'light' | 'system';

/**
 * Resolves the effective theme ('dark' or 'light') from a user preference and system media query.
 */
export function getResolvedTheme(
  preference: ThemePreference,
  systemPrefersLight?: boolean
): 'dark' | 'light' {
  if (preference === 'light') return 'light';
  if (preference === 'dark') return 'dark';

  // System auto-detection
  if (systemPrefersLight !== undefined) {
    return systemPrefersLight ? 'light' : 'dark';
  }

  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  return 'dark';
}

/**
 * Applies the resolved theme and preference data attributes to the document root element.
 */
export function applyThemeToDocument(
  preference: ThemePreference,
  systemPrefersLight?: boolean
): 'dark' | 'light' {
  const resolved = getResolvedTheme(preference, systemPrefersLight);

  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', resolved);
    document.documentElement.setAttribute('data-theme-preference', preference);
  }

  return resolved;
}

/**
 * Loads stored theme preference from chrome.storage.local or falls back to 'system'.
 */
export async function loadThemePreference(): Promise<ThemePreference> {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    try {
      const res = await chrome.storage.local.get(['theme']);
      if (res.theme === 'dark' || res.theme === 'light' || res.theme === 'system') {
        return res.theme;
      }
    } catch {
      // Fallback
    }
  }
  return 'system';
}

/**
 * Persists theme preference to chrome.storage.local.
 */
export async function saveThemePreference(theme: ThemePreference): Promise<void> {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    await chrome.storage.local.set({ theme });
  }
}

/**
 * Listens for OS level light/dark mode changes when the theme is set to 'system'.
 */
export function setupSystemThemeListener(
  onThemeChange: (resolved: 'dark' | 'light') => void
): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return () => {};
  }

  const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
  const listener = (e: MediaQueryListEvent) => {
    onThemeChange(e.matches ? 'light' : 'dark');
  };

  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  } else if ('addListener' in mediaQuery) {
    (mediaQuery as any).addListener(listener);
    return () => (mediaQuery as any).removeListener(listener);
  }

  return () => {};
}
