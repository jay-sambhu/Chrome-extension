import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  formatPersonaForExport,
  serializePersonaToJson,
  copyTextToClipboard,
} from '../src/utils/personaExport';
import { generateSyntheticPerson } from '../src/generator/personGenerator';

describe('Phase 4.2 Copy Persona as JSON / Clipboard Export', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('formatPersonaForExport', () => {
    it('structures all core Nepali persona attributes for Postman & Swagger payloads', () => {
      const person = generateSyntheticPerson('employee');
      const exported = formatPersonaForExport(person);

      // Identity & Demographics
      expect(exported.fullName).toBe(person.fullName);
      expect(exported.firstName).toBe(person.firstName);
      expect(exported.lastName).toBe(person.lastName);
      expect(exported.gender).toBe(person.gender);
      expect(exported.dateOfBirth).toBe(person.dateOfBirth);
      expect(exported.dateOfBirthBS).toBe(person.dateOfBirthBS);
      expect(exported.age).toBe(person.age);
      expect(exported.bloodGroup).toBe(person.bloodGroup);

      // Contacts
      expect(exported.phone).toBe(person.phone);
      expect(exported.telephone).toBe(person.telephone);
      expect(exported.email).toBe(person.email);
      expect(exported.username).toBe(person.username);
      expect(exported.password).toBe(person.password);

      // Address
      expect(exported.address).toBeDefined();
      expect(exported.address.province).toBe(person.address.province);
      expect(exported.address.district).toBe(person.address.district);
      expect(exported.address.municipality).toBe(person.address.municipality);
      expect(exported.address.ward).toBe(person.address.ward);
      expect(exported.address.fullAddress).toBe(person.address.fullAddress);

      // Government Identifiers
      expect(exported.citizenshipNumber).toBe(person.citizenshipNumber);
      expect(exported.citizenshipIssueDistrict).toBe(person.citizenshipIssueDistrict);
      expect(exported.nationalId).toBe(person.nationalId);

      // Professional attributes
      expect(exported.profileType).toBe('employee');
      expect(exported.occupation).toBe(person.occupation);
      expect(exported.companyName).toBe(person.companyName);

      // FinTech
      expect(exported.bankName).toBe(person.bankName);
      expect(exported.bankAccountNumber).toBe(person.bankAccountNumber);

      // Extension Metadata
      expect(exported._source).toBe('Nepal Test Filler Chrome Extension');
      expect(exported._exportedAt).toBeDefined();
    });

    it('strips undefined and null fields to avoid polluting API payloads', () => {
      const person = generateSyntheticPerson('student');
      const exported = formatPersonaForExport(person);

      for (const [key, val] of Object.entries(exported)) {
        expect(val, `Key ${key} should not be undefined or null`).not.toBeUndefined();
        expect(val, `Key ${key} should not be null`).not.toBeNull();
      }
    });

    it('omits metadata when includeMetadata is set to false', () => {
      const person = generateSyntheticPerson('general');
      const exported = formatPersonaForExport(person, { includeMetadata: false });

      expect(exported._source).toBeUndefined();
      expect(exported._exportedAt).toBeUndefined();
    });
  });

  describe('serializePersonaToJson', () => {
    it('produces valid and cleanly indented JSON string', () => {
      const person = generateSyntheticPerson('business');
      const jsonStr = serializePersonaToJson(person, { indent: 2 });

      expect(typeof jsonStr).toBe('string');
      const parsed = JSON.parse(jsonStr);

      expect(parsed.fullName).toBe(person.fullName);
      expect(parsed.businessName).toBe(person.businessName);
      expect(parsed.address.province).toBe(person.address.province);
    });

    it('preserves authentic Devanagari characters accurately without escaping errors', () => {
      const person = generateSyntheticPerson('teacher');
      const jsonStr = serializePersonaToJson(person);

      expect(jsonStr).toContain(person.devanagari!.fullName);
      expect(jsonStr).toContain(person.devanagari!.district);

      const parsed = JSON.parse(jsonStr);
      expect(parsed.devanagari.fullName).toBe(person.devanagari!.fullName);
      expect(parsed.devanagari.district).toBe(person.devanagari!.district);
    });

    it('handles all archetype profiles seamlessly (general, student, employee, business, teacher, farmer)', () => {
      const archetypes = ['general', 'student', 'employee', 'business', 'teacher', 'farmer'] as const;

      for (const arch of archetypes) {
        const person = generateSyntheticPerson(arch);
        const jsonStr = serializePersonaToJson(person);
        const parsed = JSON.parse(jsonStr);
        expect(parsed.profileType).toBe(arch);
        expect(parsed.fullName).toBe(person.fullName);
      }
    });
  });

  describe('copyTextToClipboard', () => {
    it('successfully calls navigator.clipboard.writeText when available', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      const sampleJson = '{"fullName": "Suman Shrestha"}';
      const result = await copyTextToClipboard(sampleJson);

      expect(result).toBe(true);
      expect(writeTextMock).toHaveBeenCalledWith(sampleJson);
    });

    it('falls back to document.execCommand when navigator.clipboard is rejected', async () => {
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn().mockRejectedValue(new Error('Permission denied')),
        },
      });

      // Mock execCommand in jsdom
      const execCommandMock = vi.fn().mockReturnValue(true);
      document.execCommand = execCommandMock;

      const sampleJson = '{"test": "fallback"}';
      const result = await copyTextToClipboard(sampleJson);

      expect(result).toBe(true);
      expect(execCommandMock).toHaveBeenCalledWith('copy');
    });
  });
});
