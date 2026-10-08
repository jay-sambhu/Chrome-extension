import { SupportedFieldType } from '../types';

export const DOMAIN_MAPPINGS_STORAGE_KEY = 'nepal_filler_domain_mappings';

export interface FieldMappingRule {
  /** Identifier: can match element `name`, `id`, or CSS selector */
  selectorOrName: string;
  /** The synthetic field type to fill */
  targetType: SupportedFieldType;
  /** How to match the element against selectorOrName */
  matchType?: 'name_or_id' | 'selector' | 'regex';
  /** Optional human-readable description */
  description?: string;
  /** Timestamp when rule was added */
  createdAt?: number;
}

export interface DomainMappingConfig {
  domain: string;
  rules: FieldMappingRule[];
  updatedAt: number;
}

// In-memory store fallback for test environments or non-chrome environments
const inMemoryDomainMappings: Record<string, DomainMappingConfig> = {};

/**
 * Normalizes a domain/hostname (removes protocol, port, trailing slash).
 */
export function normalizeDomain(rawDomain: string): string {
  if (!rawDomain) return 'localhost';
  let d = rawDomain.trim().toLowerCase();
  d = d.replace(/^https?:\/\//i, '');
  d = d.split('/')[0];
  d = d.split(':')[0];
  return d || 'localhost';
}

/**
 * Retrieves all saved domain mappings from Chrome storage or memory fallback.
 */
export async function getAllDomainMappings(): Promise<Record<string, DomainMappingConfig>> {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    try {
      const store = (await chrome.storage.local.get([DOMAIN_MAPPINGS_STORAGE_KEY])) as Record<string, any>;
      return (store[DOMAIN_MAPPINGS_STORAGE_KEY] as Record<string, DomainMappingConfig>) || {};
    } catch (e) {
      console.warn('[Nepal Test Filler] Failed to fetch domain mappings:', e);
    }
  }
  return { ...inMemoryDomainMappings };
}

/**
 * Retrieves the specific mapping config for a given domain.
 */
export async function getDomainMapping(rawDomain: string): Promise<DomainMappingConfig | null> {
  const domain = normalizeDomain(rawDomain);
  const all = await getAllDomainMappings();
  return all[domain] || null;
}

/**
 * Adds or updates a field mapping rule for a specific domain.
 */
export async function saveDomainRule(
  rawDomain: string,
  rule: FieldMappingRule
): Promise<DomainMappingConfig> {
  const domain = normalizeDomain(rawDomain);
  const all = await getAllDomainMappings();

  const existingConfig: DomainMappingConfig = all[domain] || {
    domain,
    rules: [],
    updatedAt: Date.now(),
  };

  // Replace existing rule if same selectorOrName exists, or append new rule
  const ruleIdx = existingConfig.rules.findIndex(
    (r) => r.selectorOrName.toLowerCase() === rule.selectorOrName.toLowerCase()
  );

  const newRule: FieldMappingRule = {
    ...rule,
    matchType: rule.matchType || 'name_or_id',
    createdAt: Date.now(),
  };

  if (ruleIdx >= 0) {
    existingConfig.rules[ruleIdx] = newRule;
  } else {
    existingConfig.rules.push(newRule);
  }

  existingConfig.updatedAt = Date.now();
  all[domain] = existingConfig;
  inMemoryDomainMappings[domain] = existingConfig;

  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    try {
      await chrome.storage.local.set({ [DOMAIN_MAPPINGS_STORAGE_KEY]: all });
    } catch (e) {
      console.warn('[Nepal Test Filler] Failed to save domain mapping:', e);
    }
  }

  return existingConfig;
}

/**
 * Deletes a single field mapping rule for a domain.
 */
export async function deleteDomainRule(
  rawDomain: string,
  selectorOrName: string
): Promise<DomainMappingConfig | null> {
  const domain = normalizeDomain(rawDomain);
  const all = await getAllDomainMappings();

  const config = all[domain];
  if (!config) return null;

  config.rules = config.rules.filter(
    (r) => r.selectorOrName.toLowerCase() !== selectorOrName.toLowerCase()
  );
  config.updatedAt = Date.now();

  all[domain] = config;
  inMemoryDomainMappings[domain] = config;

  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    try {
      await chrome.storage.local.set({ [DOMAIN_MAPPINGS_STORAGE_KEY]: all });
    } catch (e) {
      console.warn('[Nepal Test Filler] Failed to delete domain rule:', e);
    }
  }

  return config;
}

/**
 * Deletes an entire domain configuration.
 */
export async function deleteDomainMapping(rawDomain: string): Promise<void> {
  const domain = normalizeDomain(rawDomain);
  const all = await getAllDomainMappings();
  delete all[domain];
  delete inMemoryDomainMappings[domain];

  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    try {
      await chrome.storage.local.set({ [DOMAIN_MAPPINGS_STORAGE_KEY]: all });
    } catch (e) {
      console.warn('[Nepal Test Filler] Failed to delete domain mapping:', e);
    }
  }
}

/**
 * Clears all domain mappings (useful for testing or reset).
 */
export async function clearAllDomainMappings(): Promise<void> {
  for (const k of Object.keys(inMemoryDomainMappings)) {
    delete inMemoryDomainMappings[k];
  }
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    try {
      await chrome.storage.local.remove([DOMAIN_MAPPINGS_STORAGE_KEY]);
    } catch (e) {
      console.warn('[Nepal Test Filler] Failed to clear domain mappings:', e);
    }
  }
}

/**
 * Resolves whether a DOM element matches any custom domain mapping rule.
 * Highest precedence in the classification pipeline!
 */
export function matchDomainRule(
  element: HTMLElement,
  rules: FieldMappingRule[]
): FieldMappingRule | null {
  if (!rules || rules.length === 0) return null;

  const elemName = (element.getAttribute('name') || '').toLowerCase();
  const elemId = (element.getAttribute('id') || '').toLowerCase();

  for (const rule of rules) {
    const pattern = rule.selectorOrName.toLowerCase();
    const matchType = rule.matchType || 'name_or_id';

    if (matchType === 'name_or_id') {
      if (elemName === pattern || elemId === pattern) {
        return rule;
      }
    } else if (matchType === 'selector') {
      try {
        if (element.matches(rule.selectorOrName)) {
          return rule;
        }
      } catch {
        // invalid selector syntax fallback
      }
    } else if (matchType === 'regex') {
      try {
        const re = new RegExp(rule.selectorOrName, 'i');
        if (re.test(elemName) || re.test(elemId)) {
          return rule;
        }
      } catch {
        // invalid regex syntax fallback
      }
    }
  }

  return null;
}
