import { describe, it, expect, beforeEach } from 'vitest';
import {
  DISTRICT_CODES,
  PROVINCE_CODES,
  getDistrictCode,
  generateCitizenshipDetails,
  generateNationalId,
  generatePassportDetails,
  generateDrivingLicenseDetails,
  DRIVING_LICENSE_CATEGORIES,
} from '../src/generator/governmentDocuments';
import { generateSyntheticPerson } from '../src/generator/personGenerator';
import { detectFieldType } from '../src/content/detector';
import { fillPage } from '../src/content/filler';
import { splitBsDate } from '../src/generator/nepaliCalendar';
import { toEnglishNumerals } from '../src/generator/devanagariEngine';

describe('Phase 1.4 — Government & Official Document Identifiers', () => {
  describe('District & Province Codes Mapping', () => {
    it('covers all 77 districts with 2-digit numeric codes', () => {
      const uniqueCodes = new Set(Object.values(DISTRICT_CODES));
      expect(uniqueCodes.size).toBe(77);
      for (const [, code] of Object.entries(DISTRICT_CODES)) {
        expect(code).toMatch(/^\d{2}$/);
      }
    });

    it('correctly maps prominent districts', () => {
      expect(getDistrictCode('Kathmandu')).toBe('29');
      expect(getDistrictCode('Bhaktapur')).toBe('30');
      expect(getDistrictCode('Lalitpur')).toBe('31');
      expect(getDistrictCode('Morang')).toBe('05');
      expect(getDistrictCode('Kaski')).toBe('40');
    });

    it('supports 7 provinces with 2-digit codes', () => {
      expect(Object.keys(PROVINCE_CODES).length).toBe(7);
      expect(PROVINCE_CODES['Bagmati Province']).toBe('03');
      expect(PROVINCE_CODES['Gandaki Province']).toBe('04');
    });
  });

  describe('Citizenship Issue Details Engine', () => {
    it('generates citizenship issue date in BS strictly at least 16 years after birth year in BS', () => {
      // Repeat across 200 random iterations to verify mathematical constraint
      for (let i = 0; i < 200; i++) {
        const birthYearBS = Math.floor(1990 + Math.random() * 50); // 1990 to 2040
        const dobBS = `${birthYearBS}-05-15`;
        const district = 'Kathmandu';
        const doc = generateCitizenshipDetails(district, dobBS);

        const issueParts = splitBsDate(doc.citizenshipIssueDateBS);
        const issueYearBS = parseInt(issueParts.year, 10);

        expect(issueYearBS).toBeGreaterThanOrEqual(birthYearBS + 16);
        expect(doc.citizenshipIssueDistrict).toBe(district);
        expect(doc.citizenshipIssuedBy).toBe('District Administration Office, Kathmandu');
      }
    });

    it('formats citizenship number correctly with district code prefix', () => {
      const doc = generateCitizenshipDetails('Lalitpur', '2050-01-10');
      // Format: 31-01-XX-XXXXX (Lalitpur code is 31)
      expect(doc.citizenshipNumber).toMatch(/^31-01-\d{2}-\d{4,6}$/);
    });
  });

  describe('National ID (राष्ट्रिय परिचयपत्र) Engine', () => {
    it('generates 10-digit National ID numbers', () => {
      for (let i = 0; i < 50; i++) {
        const nid = generateNationalId();
        expect(nid).toMatch(/^\d{10}$/);
      }
    });

    it('supports formatted 10-digit National ID with standard spacing', () => {
      const nidFormatted = generateNationalId(true);
      expect(nidFormatted).toMatch(/^\d{3}-\d{3}-\d{4}$/);
    });
  });

  describe('Passport (राहदानी) Details Engine', () => {
    it('generates ordinary e-passport with PA/PC prefix and 7 digits', () => {
      for (let i = 0; i < 50; i++) {
        const passport = generatePassportDetails('Kathmandu', '1995-04-12');
        expect(passport.passportNumber).toMatch(/^(PA|PC)\d{7}$/);
      }
    });

    it('ensures passport validity is precisely 10 years', () => {
      for (let i = 0; i < 50; i++) {
        const district = 'Kaski';
        const passport = generatePassportDetails(district, '1998-08-20');
        const issueYear = parseInt(passport.passportIssueDate.slice(0, 4), 10);
        const expiryYear = parseInt(passport.passportExpiryDate.slice(0, 4), 10);

        expect(expiryYear - issueYear).toBe(10);
        expect([
          'Department of Passports, Kathmandu',
          `DAO, ${district}`,
        ]).toContain(passport.passportIssuedBy);
      }
    });
  });

  describe('Driving License (सवारी चालक अनुमतिपत्र) Engine', () => {
    it('generates standard DoTM format: 01-06-XXXXXXXX', () => {
      for (let i = 0; i < 50; i++) {
        const license = generateDrivingLicenseDetails('Bagmati Province');
        // Bagmati is province 03
        expect(license.drivingLicenseNumber).toMatch(/^03-\d{2}-\d{8}$/);
      }
    });

    it('ensures driving license validity is precisely 5 years', () => {
      for (let i = 0; i < 50; i++) {
        const license = generateDrivingLicenseDetails();
        const issueYear = parseInt(license.drivingLicenseIssueDate.slice(0, 4), 10);
        const expiryYear = parseInt(license.drivingLicenseExpiryDate.slice(0, 4), 10);

        expect(expiryYear - issueYear).toBe(5);
        expect(DRIVING_LICENSE_CATEGORIES).toContain(license.drivingLicenseCategory);
      }
    });
  });

  describe('Synthetic Person Integration', () => {
    it('generates a complete persona with consistent government identifiers', () => {
      const person = generateSyntheticPerson('employee');

      // Citizenship
      expect(person.citizenshipNumber).toBeDefined();
      expect(person.citizenshipIssueDistrict).toBe(person.address.district);
      expect(person.citizenshipIssuedBy).toBe(`District Administration Office, ${person.address.district}`);

      const birthYearBS = parseInt(splitBsDate(person.dateOfBirthBS!).year, 10);
      const citIssueYearBS = parseInt(splitBsDate(person.citizenshipIssueDateBS!).year, 10);
      expect(citIssueYearBS).toBeGreaterThanOrEqual(birthYearBS + 16);

      // National ID
      expect(person.nationalId).toMatch(/^\d{10}$/);

      // Passport
      expect(person.passportNumber).toMatch(/^(PA|PC)\d{7}$/);
      expect([
        'Department of Passports, Kathmandu',
        `DAO, ${person.address.district}`,
      ]).toContain(person.passportIssuedBy);

      // Driving License
      expect(person.drivingLicenseNumber).toMatch(/^\d{2}-\d{2}-\d{8}$/);
      expect(person.drivingLicenseCategory).toMatch(/Category/);

      // Devanagari details
      expect(person.devanagari).toBeDefined();
      expect(person.devanagari?.citizenshipIssueDistrict).toBe(person.devanagari?.permanentDistrict || person.devanagari?.district);
      expect(person.devanagari?.citizenshipIssuedBy).toContain('जिल्ला प्रशासन कार्यालय');
      expect(person.devanagari?.nationalId).toBeDefined();
      expect(toEnglishNumerals(person.devanagari!.nationalId!)).toBe(person.nationalId);
    });
  });

  describe('Field Detection for Government Documents', () => {
    it('detects citizenship issue district, date, and authority with high confidence', () => {
      const inputDist = document.createElement('input');
      inputDist.setAttribute('name', 'citizenship_issue_district');
      const detectedDist = detectFieldType(inputDist);
      expect(detectedDist.type).toBe('citizenshipIssueDistrict');
      expect(detectedDist.confidence).toBeGreaterThanOrEqual(0.55);

      const inputDate = document.createElement('input');
      inputDate.setAttribute('id', 'citizenship_issue_date_bs');
      const detectedDate = detectFieldType(inputDate);
      expect(detectedDate.type).toBe('citizenshipIssueDateBS');

      const inputAuth = document.createElement('input');
      inputAuth.setAttribute('name', 'nagrikta_jari_garne_karyalaya');
      const detectedAuth = detectFieldType(inputAuth);
      expect(detectedAuth.type).toBe('citizenshipIssuedBy');
    });

    it('detects Devanagari citizenship fields', () => {
      const inputDist = document.createElement('input');
      inputDist.setAttribute('placeholder', 'नागरिकता जारी जिल्ला');
      expect(detectFieldType(inputDist).type).toBe('citizenshipIssueDistrict');

      const inputDate = document.createElement('input');
      inputDate.setAttribute('name', 'नागरिकता जारी मिति');
      expect(detectFieldType(inputDate).type).toBe('citizenshipIssueDateBS');

      const inputAuth = document.createElement('input');
      inputAuth.setAttribute('placeholder', 'जिल्ला प्रशासन कार्यालय');
      expect(detectFieldType(inputAuth).type).toBe('citizenshipIssuedBy');
    });

    it('detects passport fields and distinguishes number from issue/expiry dates', () => {
      const inputNum = document.createElement('input');
      inputNum.setAttribute('name', 'passport_number');
      expect(detectFieldType(inputNum).type).toBe('passportNumber');

      const inputIssue = document.createElement('input');
      inputIssue.setAttribute('name', 'passport_issue_date');
      expect(detectFieldType(inputIssue).type).toBe('passportIssueDate');

      const inputExp = document.createElement('input');
      inputExp.setAttribute('name', 'passport_expiry_date');
      expect(detectFieldType(inputExp).type).toBe('passportExpiryDate');

      const inputBy = document.createElement('input');
      inputBy.setAttribute('name', 'passport_issuing_authority');
      expect(detectFieldType(inputBy).type).toBe('passportIssuedBy');
    });

    it('detects driving license number and category', () => {
      const inputNum = document.createElement('input');
      inputNum.setAttribute('name', 'driving_license_no');
      expect(detectFieldType(inputNum).type).toBe('drivingLicenseNumber');

      const selectCat = document.createElement('select');
      selectCat.setAttribute('name', 'license_category');
      expect(detectFieldType(selectCat).type).toBe('drivingLicenseCategory');

      const inputNepaliLic = document.createElement('input');
      inputNepaliLic.setAttribute('name', 'सवारी चालक अनुमतिपत्र नं');
      expect(detectFieldType(inputNepaliLic).type).toBe('drivingLicenseNumber');
    });
  });

  describe('Form Filling and Dropdown Option Matching', () => {
    let form: HTMLFormElement;

    beforeEach(() => {
      document.body.innerHTML = '';
      form = document.createElement('form');
      document.body.appendChild(form);
    });

    it('fills government document fields accurately in English', () => {
      form.innerHTML = `
        <input name="citizenship_no" type="text" />
        <input name="citizenship_issue_district" type="text" />
        <input name="citizenship_issue_date_bs" type="text" />
        <input name="citizenship_issued_by" type="text" />
        <input name="national_id" type="text" />
        <input name="passport_no" type="text" />
        <input name="passport_issue_date" type="text" />
        <input name="passport_expiry_date" type="text" />
        <input name="passport_issued_by" type="text" />
        <input name="driving_license_no" type="text" />
      `;

      const person = generateSyntheticPerson('employee');
      const results = fillPage(person, {
        profile: 'employee',
        script: 'en',
        fillCategories: { personal: true, contact: true, address: true, professional: true },
      });

      expect(results.success).toBe(true);
      expect(results.fieldsFilledCount).toBe(10);

      const citNo = (form.querySelector('input[name="citizenship_no"]') as HTMLInputElement).value;
      const citDist = (form.querySelector('input[name="citizenship_issue_district"]') as HTMLInputElement).value;
      const citDate = (form.querySelector('input[name="citizenship_issue_date_bs"]') as HTMLInputElement).value;
      const nid = (form.querySelector('input[name="national_id"]') as HTMLInputElement).value;
      const passNo = (form.querySelector('input[name="passport_no"]') as HTMLInputElement).value;
      const licNo = (form.querySelector('input[name="driving_license_no"]') as HTMLInputElement).value;

      expect(citNo).toBe(person.citizenshipNumber);
      expect(citDist).toBe(person.citizenshipIssueDistrict);
      expect(citDate).toBe(person.citizenshipIssueDateBS);
      expect(nid).toBe(person.nationalId);
      expect(passNo).toBe(person.passportNumber);
      expect(licNo).toBe(person.drivingLicenseNumber);
    });

    it('matches and selects driving license category in select elements', () => {
      form.innerHTML = `
        <select name="license_category">
          <option value="">Select Category</option>
          <option value="A">Category A: Motorcycle</option>
          <option value="B">Category B: Car/Jeep</option>
          <option value="K">Category K: Scooter</option>
        </select>
      `;

      const person = generateSyntheticPerson('employee');
      // Force license category to Category B
      person.drivingLicenseCategory = 'Category B (Car/Jeep/Van)';

      const results = fillPage(person, {
        profile: 'employee',
        script: 'en',
        fillCategories: { personal: true, contact: true, address: true, professional: true },
      });

      expect(results.success).toBe(true);
      const select = form.querySelector('select[name="license_category"]') as HTMLSelectElement;
      expect(select.value).toBe('B');
    });

    it('fills government document fields in Devanagari script', () => {
      form.innerHTML = `
        <input name="citizenship_no" type="text" />
        <input name="national_id" type="text" />
        <input name="citizenship_issued_by" type="text" />
        <input name="passport_issued_by" type="text" />
      `;

      const person = generateSyntheticPerson('employee');
      const results = fillPage(person, {
        profile: 'employee',
        script: 'np',
        fillCategories: { personal: true, contact: true, address: true, professional: true },
      });

      expect(results.success).toBe(true);
      const citAuth = (form.querySelector('input[name="citizenship_issued_by"]') as HTMLInputElement).value;
      const passAuth = (form.querySelector('input[name="passport_issued_by"]') as HTMLInputElement).value;
      const nid = (form.querySelector('input[name="national_id"]') as HTMLInputElement).value;

      expect(citAuth).toContain('जिल्ला प्रशासन कार्यालय');
      expect(passAuth).toBe(person.devanagari?.passportIssuedBy);
      expect(nid).toBe(person.devanagari?.nationalId);
    });
  });
});
