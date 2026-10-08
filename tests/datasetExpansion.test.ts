import { describe, it, expect } from 'vitest';
import {
  filterValidCandidates,
  validateCompanyEntry,
  validateInstitutionEntry,
  validateNameEntry,
  validateOccupationEntry,
} from '../scripts/expandDataset';

describe('Administrative Dataset Expansion Schema & Validation', () => {
  describe('Name Entry Validation', () => {
    const existingNames = ['Aadarsh', 'Bibek', 'Chandan'];

    it('accepts authentic capitalized Nepali names', () => {
      expect(validateNameEntry('Deepak', existingNames).valid).toBe(true);
      expect(validateNameEntry('Ghanashyam', existingNames).valid).toBe(true);
      expect(validateNameEntry('Birodh-Kaji', existingNames).valid).toBe(true);
    });

    it('rejects duplicate names case-insensitively', () => {
      const res = validateNameEntry('bibek', existingNames);
      expect(res.valid).toBe(false);
      expect(res.reason).toContain('Duplicate');
    });

    it('rejects invalid names with digits or non-letters', () => {
      expect(validateNameEntry('Aadarsh123', existingNames).valid).toBe(false);
      expect(validateNameEntry('bimal', existingNames).valid).toBe(false); // lower case start
      expect(validateNameEntry('', existingNames).valid).toBe(false);
    });
  });

  describe('Occupation Entry Validation', () => {
    const existingOccupations = [
      { title: 'Software Engineer', department: 'IT', companyType: 'Tech' },
    ];

    it('accepts complete, valid occupation records', () => {
      const valid = {
        title: 'Network Administrator',
        department: 'Infrastructure & Support',
        companyType: 'Tech',
      };
      expect(validateOccupationEntry(valid, existingOccupations).valid).toBe(true);
    });

    it('rejects duplicate occupation titles', () => {
      const duplicate = {
        title: 'software engineer',
        department: 'Engineering',
        companyType: 'Tech',
      };
      const res = validateOccupationEntry(duplicate, existingOccupations);
      expect(res.valid).toBe(false);
      expect(res.reason).toContain('Duplicate');
    });

    it('rejects incomplete occupation records', () => {
      expect(validateOccupationEntry({ title: '', department: 'IT', companyType: 'Tech' }, existingOccupations).valid).toBe(false);
      expect(validateOccupationEntry({ title: 'Nurse' }, existingOccupations).valid).toBe(false);
    });
  });

  describe('Company Entry Validation', () => {
    const existingCompanies = [
      { name: 'Danphe Digital Solutions Pvt. Ltd.', type: 'Tech' },
    ];

    it('accepts valid company entry', () => {
      const valid = { name: 'Annapurna Cloud Systems', type: 'Tech' };
      expect(validateCompanyEntry(valid, existingCompanies).valid).toBe(true);
    });

    it('rejects duplicate company name', () => {
      const duplicate = { name: 'danphe digital solutions pvt. ltd.', type: 'Corporate' };
      const res = validateCompanyEntry(duplicate, existingCompanies);
      expect(res.valid).toBe(false);
      expect(res.reason).toContain('Duplicate');
    });
  });

  describe('Educational Institution Entry Validation', () => {
    const existingInstitutions = [
      { name: 'Tribhuvan University', type: 'University' as const, location: 'Kirtipur, Kathmandu' },
    ];

    it('accepts valid institution with allowed type', () => {
      const valid = {
        name: 'Nepal Engineering College',
        type: 'College' as const,
        location: 'Changunarayan, Bhaktapur',
      };
      expect(validateInstitutionEntry(valid, existingInstitutions).valid).toBe(true);
    });

    it('rejects institution with disallowed type', () => {
      const invalidType = {
        name: 'Nepal Coaching Center',
        type: 'TuitionCenter' as any,
        location: 'Kathmandu',
      };
      const res = validateInstitutionEntry(invalidType, existingInstitutions);
      expect(res.valid).toBe(false);
      expect(res.reason).toContain('Invalid type');
    });
  });

  describe('Batch Candidate Filtering', () => {
    it('accurately partitions valid candidates and discards invalid or duplicate candidates', () => {
      const existing = ['Aadarsh', 'Bikash'];
      const candidates = ['Chandra', 'aadarsh', 'Dipak99', 'Eakraj', ''];

      const result = filterValidCandidates<string>('maleNames', candidates, existing);
      expect(result.valid).toEqual(['Chandra', 'Eakraj']);
      expect(result.rejected.length).toBe(3);
    });
  });
});
