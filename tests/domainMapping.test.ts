import { describe, it, expect, beforeEach } from 'vitest';
import {
  clearAllDomainMappings,
  deleteDomainMapping,
  deleteDomainRule,
  getAllDomainMappings,
  getDomainMapping,
  matchDomainRule,
  normalizeDomain,
  saveDomainRule,
} from '../src/services/domainMapping';

describe('Website-Specific Domain Mapping Engine', () => {
  beforeEach(async () => {
    await clearAllDomainMappings();
  });

  describe('Domain Normalization', () => {
    it('normalizes full URLs, ports, and trailing slashes to bare hostname', () => {
      expect(normalizeDomain('https://esewa.com.np/payment/v2/')).toBe('esewa.com.np');
      expect(normalizeDomain('http://localhost:3000/checkout')).toBe('localhost');
      expect(normalizeDomain('  PORTAL.GOV.NP:8080/app ')).toBe('portal.gov.np');
    });
  });

  describe('Rule Storage & Retrieval', () => {
    it('saves and retrieves domain rules', async () => {
      await saveDomainRule('esewa.com.np', {
        selectorOrName: 'cust_ref_no',
        targetType: 'referenceNumber',
        description: 'eSewa Customer Reference',
      });

      const config = await getDomainMapping('https://esewa.com.np/');
      expect(config).not.toBeNull();
      expect(config?.domain).toBe('esewa.com.np');
      expect(config?.rules.length).toBe(1);
      expect(config?.rules[0].targetType).toBe('referenceNumber');
      expect(config?.rules[0].selectorOrName).toBe('cust_ref_no');
    });

    it('updates existing rule with same selectorOrName instead of duplicating', async () => {
      await saveDomainRule('khalti.com', {
        selectorOrName: 'account_id',
        targetType: 'panNumber',
      });

      await saveDomainRule('khalti.com', {
        selectorOrName: 'account_id',
        targetType: 'referenceNumber',
      });

      const config = await getDomainMapping('khalti.com');
      expect(config?.rules.length).toBe(1);
      expect(config?.rules[0].targetType).toBe('referenceNumber');
    });

    it('deletes individual rules and entire domain configs', async () => {
      await saveDomainRule('portal.np', { selectorOrName: 'fieldA', targetType: 'fullName' });
      await saveDomainRule('portal.np', { selectorOrName: 'fieldB', targetType: 'email' });

      let config = await getDomainMapping('portal.np');
      expect(config?.rules.length).toBe(2);

      await deleteDomainRule('portal.np', 'fieldA');
      config = await getDomainMapping('portal.np');
      expect(config?.rules.length).toBe(1);
      expect(config?.rules[0].selectorOrName).toBe('fieldB');

      await deleteDomainMapping('portal.np');
      expect(await getDomainMapping('portal.np')).toBeNull();
    });
  });

  describe('DOM Element Rule Matching (Precedence Hierarchy)', () => {
    it('matches elements by name or id attribute', () => {
      const input = document.createElement('input');
      input.setAttribute('name', 'custom_nepal_pan_id');
      input.id = 'txt_nepal_pan';

      const matchedByName = matchDomainRule(input, [
        { selectorOrName: 'custom_nepal_pan_id', targetType: 'panNumber', matchType: 'name_or_id' },
      ]);
      expect(matchedByName?.targetType).toBe('panNumber');

      const matchedById = matchDomainRule(input, [
        { selectorOrName: 'txt_nepal_pan', targetType: 'panNumber', matchType: 'name_or_id' },
      ]);
      expect(matchedById?.targetType).toBe('panNumber');
    });

    it('matches elements by CSS selector', () => {
      const input = document.createElement('input');
      input.className = 'gov-special-field tracking-code';
      input.setAttribute('data-purpose', 'nid');

      const matched = matchDomainRule(input, [
        { selectorOrName: 'input[data-purpose="nid"]', targetType: 'nationalId', matchType: 'selector' },
      ]);
      expect(matched?.targetType).toBe('nationalId');
    });

    it('matches elements by regex on name or id', () => {
      const input = document.createElement('input');
      input.name = 'order_ref_2026_x';

      const matched = matchDomainRule(input, [
        { selectorOrName: '^order_ref_\\d+', targetType: 'referenceNumber', matchType: 'regex' },
      ]);
      expect(matched?.targetType).toBe('referenceNumber');
    });

    it('returns null if element does not match any domain rule', () => {
      const input = document.createElement('input');
      input.name = 'unrelated_input';

      const matched = matchDomainRule(input, [
        { selectorOrName: 'cust_id', targetType: 'referenceNumber' },
      ]);
      expect(matched).toBeNull();
    });
  });
});
