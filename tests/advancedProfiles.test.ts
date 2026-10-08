import { describe, it, expect } from 'vitest';
import {
  generateSyntheticPerson,
  convertAdToBs,
  generateCitizenshipNumber,
  generateNationalId,
} from '../src/generator/personGenerator';
import { detectFieldType } from '../src/content/detector';

describe('Phase 7 — Advanced Specialized Profiles & Utilities', () => {
  describe('Specialized Archetype Profiles', () => {
    it('generates fully enriched Student profile', () => {
      const student = generateSyntheticPerson('student');
      expect(student.profileType).toBe('student');
      expect(student.studentId).toMatch(/^STU-\d{4}-\d{4}$/);
      expect(student.school).toBeTruthy();
      expect(student.grade).toBeTruthy();
      expect(student.faculty).toMatch(/Faculty|Institute/);
      expect(student.guardianName).toBeTruthy();
      expect(student.guardianPhone).toMatch(/^9[78]\d{8}$/);
      expect(student.dateOfBirthBS).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('generates fully enriched Employee profile', () => {
      const emp = generateSyntheticPerson('employee');
      expect(emp.profileType).toBe('employee');
      expect(emp.employeeId).toMatch(/^EMP-\d{5}$/);
      expect(emp.workEmail).toMatch(/@.+\.com\.np$/);
      expect(emp.designation).toBeTruthy();
      expect(emp.salary).toMatch(/^\d{2,3},000 NPR$/);
      expect(emp.panNumber).toMatch(/^\d{9}$/);
    });

    it('generates fully enriched Business Owner profile', () => {
      const biz = generateSyntheticPerson('business');
      expect(biz.profileType).toBe('business');
      expect(biz.businessName).toBeTruthy();
      expect(['Private Limited', 'Proprietorship', 'Partnership Firm']).toContain(biz.businessType);
      expect(biz.panNumber).toMatch(/^\d{9}$/);
      expect(biz.vatNumber).toBe(`VAT-${biz.panNumber}`);
      expect(biz.registeredAddress).toBe(biz.address.fullAddress);
    });

    it('generates fully enriched Farmer profile with rural focus', () => {
      const farmer = generateSyntheticPerson('farmer');
      expect(farmer.profileType).toBe('farmer');
      expect(farmer.cropType).toBeTruthy();
      expect(farmer.cooperative).toContain('Sana Kisan Agriculture Cooperative Ltd.');
      expect(farmer.occupation).toContain('Farmer');
    });

    it('generates fully enriched Teacher profile', () => {
      const teacher = generateSyntheticPerson('teacher');
      expect(teacher.profileType).toBe('teacher');
      expect(teacher.subject).toBeTruthy();
      expect(teacher.faculty).toMatch(/Faculty/);
      expect(teacher.school).toBeTruthy();
      expect(teacher.employeeId).toMatch(/^FAC-\d{4}$/);
    });
  });

  describe('Nepali Date (BS) and National Identification Generators', () => {
    it('converts AD date to Bikram Sambat (BS) date correctly', () => {
      const bs1 = convertAdToBs('1998-05-15');
      // 1998 AD is approx 2055 BS (Jestha)
      expect(bs1).toMatch(/^2055-\d{2}-\d{2}$/);

      const bs2 = convertAdToBs('2024-01-10');
      // 2024 January (before New Year in April) is 2024 + 56 = 2080 BS (Poush)
      expect(bs2).toMatch(/^2080-\d{2}-\d{2}$/);

      expect(convertAdToBs('invalid')).toBe('');
    });

    it('generates valid Nepali citizenship numbers', () => {
      for (let i = 0; i < 20; i++) {
        const c = generateCitizenshipNumber();
        expect(c).toMatch(/^\d{2}-01-\d{2}-\d{5}$/);
      }
    });

    it('generates valid 10-digit National ID numbers', () => {
      for (let i = 0; i < 20; i++) {
        const nid = generateNationalId();
        expect(nid).toMatch(/^\d{10}$/);
      }
    });
  });

  describe('Field Detection for Specialized Profile Attributes', () => {
    it('detects salary and income fields in English and Devanagari', () => {
      const inputEng = document.createElement('input');
      inputEng.setAttribute('name', 'monthly_salary');
      const detEng = detectFieldType(inputEng);
      expect(detEng.type).toBe('salary');

      const inputDev = document.createElement('input');
      inputDev.setAttribute('placeholder', 'मासिक तलब');
      const detDev = detectFieldType(inputDev);
      expect(detDev.type).toBe('salary');
    });

    it('detects academic faculty and grade fields', () => {
      const inputFac = document.createElement('input');
      inputFac.setAttribute('id', 'student_faculty');
      const detFac = detectFieldType(inputFac);
      expect(detFac.type).toBe('faculty');

      const inputGrade = document.createElement('input');
      inputGrade.setAttribute('name', 'academic_level');
      const detGrade = detectFieldType(inputGrade);
      expect(detGrade.type).toBe('grade');
    });

    it('detects cooperative and crop type fields', () => {
      const inputCoop = document.createElement('input');
      inputCoop.setAttribute('name', 'krishi_sahakari');
      const detCoop = detectFieldType(inputCoop);
      expect(detCoop.type).toBe('cooperative');

      const inputCrop = document.createElement('input');
      inputCrop.setAttribute('placeholder', 'मुख्य बाली');
      const detCrop = detectFieldType(inputCrop);
      expect(detCrop.type).toBe('cropType');
    });

    it('detects Bikram Sambat Date of Birth fields before standard AD DOB', () => {
      const inputBs = document.createElement('input');
      inputBs.setAttribute('name', 'dob_bs');
      const detBs = detectFieldType(inputBs);
      expect(detBs.type).toBe('dateOfBirthBS');

      const inputBsDev = document.createElement('input');
      inputBsDev.setAttribute('placeholder', 'जन्म मिति (वि.सं.)');
      const detBsDev = detectFieldType(inputBsDev);
      expect(detBsDev.type).toBe('dateOfBirthBS');
    });
  });
});
