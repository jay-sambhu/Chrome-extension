import { describe, it, expect, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { detectFieldType } from '../src/content/detector';

describe('Phase 5.1 Local Demo Test Form Page (demo/index.html)', () => {
  let htmlContent: string;
  let container: HTMLElement;

  beforeEach(() => {
    const demoPath = path.resolve(__dirname, '../demo/index.html');
    htmlContent = fs.readFileSync(demoPath, 'utf-8');
    document.body.innerHTML = htmlContent;
    container = document.body;
  });

  describe('Page Structure & Essential Showcase Forms', () => {
    it('contains all 6 core form panels', () => {
      expect(container.querySelector('#panel-loksewa')).not.toBeNull();
      expect(container.querySelector('#panel-fintech')).not.toBeNull();
      expect(container.querySelector('#panel-university')).not.toBeNull();
      expect(container.querySelector('#panel-employment')).not.toBeNull();
      expect(container.querySelector('#panel-wizard')).not.toBeNull();
      expect(container.querySelector('#panel-custom')).not.toBeNull();
    });

    it('contains the Loksewa Aayog form with all required Nepali attributes', () => {
      const form = container.querySelector('#form-loksewa') as HTMLFormElement;
      expect(form).not.toBeNull();

      // Devanagari & English Name fields
      expect(form.querySelector('#loksewa-fname')).not.toBeNull();
      expect(form.querySelector('#loksewa-lname')).not.toBeNull();
      expect(form.querySelector('#loksewa-fullname')).not.toBeNull();
      expect(form.querySelector('#loksewa-npname')).not.toBeNull();

      // DOB AD & BS
      expect(form.querySelector('#loksewa-dob-ad')).not.toBeNull();
      expect(form.querySelector('#loksewa-dob-bs')).not.toBeNull();

      // Citizenship credentials
      expect(form.querySelector('#loksewa-citizenship')).not.toBeNull();
      expect(form.querySelector('#loksewa-citizenship-dist')).not.toBeNull();
      expect(form.querySelector('#loksewa-nid')).not.toBeNull();

      // Address hierarchy
      expect(form.querySelector('#loksewa-province')).not.toBeNull();
      expect(form.querySelector('#loksewa-district')).not.toBeNull();
      expect(form.querySelector('#loksewa-municipality')).not.toBeNull();
      expect(form.querySelector('#loksewa-ward')).not.toBeNull();
    });

    it('contains the FinTech & Banking form with eSewa, Bank, PAN, and Account fields', () => {
      const form = container.querySelector('#form-fintech') as HTMLFormElement;
      expect(form).not.toBeNull();

      expect(form.querySelector('#fintech-esewa')).not.toBeNull();
      expect(form.querySelector('#fintech-bank')).not.toBeNull();
      expect(form.querySelector('#fintech-accno')).not.toBeNull();
      expect(form.querySelector('#fintech-pan')).not.toBeNull();
      expect(form.querySelector('#fintech-amount')).not.toBeNull();
    });

    it('contains the University Admission form with Roll number, Faculty, and Blood Group', () => {
      const form = container.querySelector('#form-university') as HTMLFormElement;
      expect(form).not.toBeNull();

      expect(form.querySelector('#uni-name')).not.toBeNull();
      expect(form.querySelector('#uni-roll')).not.toBeNull();
      expect(form.querySelector('#uni-faculty')).not.toBeNull();
      expect(form.querySelector('#uni-college')).not.toBeNull();
      expect(form.querySelector('#uni-blood')).not.toBeNull();
      expect(form.querySelector('#uni-guardian')).not.toBeNull();
      expect(form.querySelector('#uni-gphone')).not.toBeNull();
    });

    it('contains the Multi-Step Wizard form with steps and navigation controls', () => {
      const form = container.querySelector('#form-wizard') as HTMLFormElement;
      expect(form).not.toBeNull();

      expect(container.querySelector('#wizardStep1')).not.toBeNull();
      expect(container.querySelector('#wizardStep2')).not.toBeNull();
      expect(container.querySelector('#wizardStep3')).not.toBeNull();
      expect(container.querySelector('#wizPrevBtn')).not.toBeNull();
      expect(container.querySelector('#wizNextBtn')).not.toBeNull();
    });

    it('contains the Custom Controls & Shadow DOM mount host', () => {
      expect(container.querySelector('#shadowHost')).not.toBeNull();
      expect(container.querySelector('#customAriaAgree')).not.toBeNull();
    });
  });

  describe('Form Field Classifier Compatibility with Detector Engine', () => {
    it('detects Loksewa form fields accurately with detectFieldType', () => {
      const citizenshipInput = container.querySelector('#loksewa-citizenship') as HTMLInputElement;
      expect(detectFieldType(citizenshipInput)?.type).toBe('citizenshipNumber');

      const npNameInput = container.querySelector('#loksewa-npname') as HTMLInputElement;
      const npNameDetected = detectFieldType(npNameInput);
      expect(npNameDetected?.type).toBe('fullName');
      expect(npNameDetected?.script).toBe('np');

      const dobBsInput = container.querySelector('#loksewa-dob-bs') as HTMLInputElement;
      expect(detectFieldType(dobBsInput)?.type).toBe('dateOfBirthBS');

      const provinceInput = container.querySelector('#loksewa-province') as HTMLSelectElement;
      expect(detectFieldType(provinceInput)?.type).toBe('province');

      const wardInput = container.querySelector('#loksewa-ward') as HTMLInputElement;
      expect(detectFieldType(wardInput)?.type).toBe('ward');

      const phoneInput = container.querySelector('#loksewa-phone') as HTMLInputElement;
      expect(detectFieldType(phoneInput)?.type).toBe('phone');
    });

    it('detects FinTech form fields accurately with detectFieldType', () => {
      const panInput = container.querySelector('#fintech-pan') as HTMLInputElement;
      expect(detectFieldType(panInput)?.type).toBe('panNumber');

      const bankSelect = container.querySelector('#fintech-bank') as HTMLSelectElement;
      expect(detectFieldType(bankSelect)?.type).toBe('bankName');

      const accInput = container.querySelector('#fintech-accno') as HTMLInputElement;
      expect(detectFieldType(accInput)?.type).toBe('bankAccountNumber');
    });

    it('detects University admission form fields accurately with detectFieldType', () => {
      const rollInput = container.querySelector('#uni-roll') as HTMLInputElement;
      expect(detectFieldType(rollInput)?.type).toBe('studentId');

      const bloodSelect = container.querySelector('#uni-blood') as HTMLSelectElement;
      expect(detectFieldType(bloodSelect)?.type).toBe('bloodGroup');

      const facultySelect = container.querySelector('#uni-faculty') as HTMLSelectElement;
      expect(detectFieldType(facultySelect)?.type).toBe('faculty');
    });
  });
});
