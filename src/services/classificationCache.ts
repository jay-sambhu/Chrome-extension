import { ClassificationCacheEntry, ClassificationResult, FieldClassificationPayload, SupportedFieldType } from '../types';

export const CACHE_STORAGE_KEY = 'nepal_filler_ai_cache';

// In-memory fallback for environments without chrome.storage (e.g. tests)
const inMemoryCache = new Map<string, ClassificationCacheEntry>();

/**
 * Normalizes an individual signal token.
 */
function cleanSignal(text?: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Computes a deterministic cache key based only on sanitized field metadata and host domain.
 */
export function computeFieldHash(payload: FieldClassificationPayload): string {
  const domain = cleanSignal(payload.domain || 'unknown');
  const name = cleanSignal(payload.name);
  const id = cleanSignal(payload.id);
  const placeholder = cleanSignal(payload.placeholder);
  const label = cleanSignal(payload.label);
  const type = cleanSignal(payload.type || 'text');

  return `${domain}::[${name}]::[${id}]::[${placeholder}]::[${label}]::[${type}]`;
}

/**
 * Retrieves a cached classification result if present.
 */
export async function getCachedClassification(
  payload: FieldClassificationPayload
): Promise<ClassificationResult | null> {
  const hashKey = computeFieldHash(payload);

  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    try {
      const store = (await chrome.storage.local.get([CACHE_STORAGE_KEY])) as Record<string, any>;
      const cache: Record<string, ClassificationCacheEntry> = store[CACHE_STORAGE_KEY] || {};
      const entry = cache[hashKey];
      if (entry && entry.fieldType) {
        return {
          fieldType: entry.fieldType,
          confidence: entry.confidence,
          reasoning: entry.reasoning,
          fromCache: true,
        };
      }
    } catch (e) {
      console.warn('[Nepal Test Filler] Failed to read classification cache:', e);
    }
  }

  // Fallback to in-memory cache
  const inMem = inMemoryCache.get(hashKey);
  if (inMem) {
    return {
      fieldType: inMem.fieldType,
      confidence: inMem.confidence,
      reasoning: inMem.reasoning,
      fromCache: true,
    };
  }

  return null;
}

/**
 * Persists a classification result into local storage.
 */
export async function saveCachedClassification(
  payload: FieldClassificationPayload,
  result: { fieldType: SupportedFieldType; confidence: number; reasoning?: string }
): Promise<void> {
  const hashKey = computeFieldHash(payload);
  const entry: ClassificationCacheEntry = {
    fieldType: result.fieldType,
    confidence: result.confidence,
    reasoning: result.reasoning,
    timestamp: Date.now(),
  };

  inMemoryCache.set(hashKey, entry);

  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    try {
      const store = (await chrome.storage.local.get([CACHE_STORAGE_KEY])) as Record<string, any>;
      const cache: Record<string, ClassificationCacheEntry> = store[CACHE_STORAGE_KEY] || {};
      cache[hashKey] = entry;
      await chrome.storage.local.set({ [CACHE_STORAGE_KEY]: cache });
    } catch (e) {
      console.warn('[Nepal Test Filler] Failed to write classification cache:', e);
    }
  }
}

/**
 * Clears all cached AI classifications.
 */
export async function clearClassificationCache(): Promise<void> {
  inMemoryCache.clear();
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    try {
      await chrome.storage.local.remove([CACHE_STORAGE_KEY]);
    } catch (e) {
      console.warn('[Nepal Test Filler] Failed to clear classification cache:', e);
    }
  }
}

/**
 * Returns summary statistics for cached classifications.
 */
export async function getCacheStats(): Promise<{ count: number; keys: string[] }> {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    try {
      const store = (await chrome.storage.local.get([CACHE_STORAGE_KEY])) as Record<string, any>;
      const cache: Record<string, ClassificationCacheEntry> = store[CACHE_STORAGE_KEY] || {};
      const keys = Object.keys(cache);
      return { count: keys.length, keys };
    } catch {
      // fallback to memory
    }
  }
  return {
    count: inMemoryCache.size,
    keys: Array.from(inMemoryCache.keys()),
  };
}
