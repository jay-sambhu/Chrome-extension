import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getSessionPersona,
  setSessionPersona,
  clearSessionPersona,
  hasSessionPersona,
  getSessionOptions,
  setSessionOptions,
  setSessionPersistenceEnabled,
  isSessionPersistenceEnabled,
  SESSION_PERSONA_KEY,
} from '../src/services/sessionPersona';
import { generateSyntheticPerson } from '../src/generator/personGenerator';
import { fillPage, clearSnapshot } from '../src/content/filler';
import { FillOptions } from '../src/types';

describe('Phase 2.3 — Multi-Step Wizard & SPA Session Persistence', () => {
  beforeEach(() => {
    sessionStorage.clear();
    clearSessionPersona();
    clearSnapshot();
    setSessionPersistenceEnabled(true);
    document.body.innerHTML = '';
  });

  afterEach(() => {
    sessionStorage.clear();
    clearSessionPersona();
    setSessionPersistenceEnabled(true);
  });

  describe('Session Storage Persona Management', () => {
    it('returns null when no persona has been stored', () => {
      expect(getSessionPersona()).toBeNull();
      expect(hasSessionPersona()).toBe(false);
    });

    it('stores and retrieves a synthetic person accurately', () => {
      const person = generateSyntheticPerson('general');
      const success = setSessionPersona(person);

      expect(success).toBe(true);
      expect(hasSessionPersona()).toBe(true);

      const retrieved = getSessionPersona();
      expect(retrieved).not.toBeNull();
      expect(retrieved?.fullName).toBe(person.fullName);
      expect(retrieved?.phone).toBe(person.phone);
      expect(retrieved?.citizenshipNumber).toBe(person.citizenshipNumber);
      expect(retrieved?.address.district).toBe(person.address.district);
    });

    it('clears session persona properly', () => {
      const person = generateSyntheticPerson('student');
      setSessionPersona(person);
      expect(hasSessionPersona()).toBe(true);

      clearSessionPersona();
      expect(getSessionPersona()).toBeNull();
      expect(hasSessionPersona()).toBe(false);
      expect(sessionStorage.getItem(SESSION_PERSONA_KEY)).toBeNull();
    });

    it('stores and retrieves session fill options', () => {
      const options: FillOptions = {
        profile: 'employee',
        fillScript: 'np',
        fillCategories: { personal: true, contact: true, address: false, professional: true },
      };

      setSessionOptions(options);
      const retrieved = getSessionOptions();
      expect(retrieved).toEqual(options);
    });

    it('respects setSessionPersistenceEnabled(false) toggle', () => {
      const person = generateSyntheticPerson('business');
      setSessionPersona(person);
      expect(hasSessionPersona()).toBe(true);

      setSessionPersistenceEnabled(false);
      expect(isSessionPersistenceEnabled()).toBe(false);
      expect(getSessionPersona()).toBeNull();

      // Attempts to write while disabled should fail
      const result = setSessionPersona(person);
      expect(result).toBe(false);
    });

    it('falls back gracefully when sessionStorage throws a SecurityError', () => {
      const mockStorage: Storage = {
        length: 0,
        clear: vi.fn(),
        getItem: vi.fn(() => {
          throw new DOMException('The operation is insecure.', 'SecurityError');
        }),
        key: vi.fn(),
        removeItem: vi.fn(),
        setItem: vi.fn(() => {
          throw new DOMException('The operation is insecure.', 'SecurityError');
        }),
      };

      const person = generateSyntheticPerson('teacher');
      const writeResult = setSessionPersona(person, mockStorage);
      expect(writeResult).toBe(true); // handled via in-memory fallback

      const readResult = getSessionPersona(mockStorage);
      expect(readResult?.fullName).toBe(person.fullName);
    });
  });

  describe('Multi-Step Form Wizard Retention Simulation', () => {
    it('retains the same persona across simulated multi-step wizard navigation', () => {
      const activePersona = generateSyntheticPerson('student');
      setSessionPersona(activePersona);

      // STEP 1: Personal Information Form
      const step1Container = document.createElement('div');
      step1Container.id = 'wizard-step-1';
      step1Container.innerHTML = `
        <form id="step1-form">
          <input type="text" name="full_name" id="s1_name" />
          <input type="text" name="phone" id="s1_phone" />
          <input type="text" name="citizenship_number" id="s1_cit" />
        </form>
      `;
      document.body.appendChild(step1Container);

      const retainedInStep1 = getSessionPersona();
      expect(retainedInStep1).not.toBeNull();

      const options: FillOptions = {
        profile: 'student',
        fillScript: 'en',
        fillCategories: { personal: true, contact: true, address: true, professional: true },
      };

      fillPage(retainedInStep1!, options, step1Container);

      const nameInput = document.getElementById('s1_name') as HTMLInputElement;
      const phoneInput = document.getElementById('s1_phone') as HTMLInputElement;
      const citInput = document.getElementById('s1_cit') as HTMLInputElement;

      expect(nameInput.value).toBe(activePersona.fullName);
      expect(phoneInput.value).toBe(activePersona.phone);
      expect(citInput.value).toBe(activePersona.citizenshipNumber);

      // SIMULATE STEP 2 NAVIGATION:
      // In SPA or multi-step wizard, previous DOM is replaced with Step 2 (Address)
      document.body.innerHTML = '';
      const step2Container = document.createElement('div');
      step2Container.id = 'wizard-step-2';
      step2Container.innerHTML = `
        <form id="step2-form">
          <input type="text" name="province" id="s2_province" />
          <input type="text" name="district" id="s2_district" />
          <input type="text" name="municipality" id="s2_municipality" />
          <input type="text" name="ward" id="s2_ward" />
        </form>
      `;
      document.body.appendChild(step2Container);

      // Step 2 retrieves persona from sessionStorage
      const retainedInStep2 = getSessionPersona();
      expect(retainedInStep2).not.toBeNull();
      expect(retainedInStep2?.fullName).toBe(activePersona.fullName);

      fillPage(retainedInStep2!, options, step2Container);

      const provinceInput = document.getElementById('s2_province') as HTMLInputElement;
      const districtInput = document.getElementById('s2_district') as HTMLInputElement;
      const muniInput = document.getElementById('s2_municipality') as HTMLInputElement;
      const wardInput = document.getElementById('s2_ward') as HTMLInputElement;

      expect(provinceInput.value).toBe(activePersona.address.province);
      expect(districtInput.value).toBe(activePersona.address.district);
      expect(muniInput.value).toBe(activePersona.address.municipality);
      expect(wardInput.value).toBe(String(activePersona.address.ward));

      // SIMULATE STEP 3 NAVIGATION:
      // Academic / Education details
      document.body.innerHTML = '';
      const step3Container = document.createElement('div');
      step3Container.id = 'wizard-step-3';
      step3Container.innerHTML = `
        <form id="step3-form">
          <input type="text" name="student_id" id="s3_roll" />
          <input type="text" name="school" id="s3_school" />
          <input type="text" name="guardian_name" id="s3_guardian" />
        </form>
      `;
      document.body.appendChild(step3Container);

      const retainedInStep3 = getSessionPersona();
      expect(retainedInStep3?.fullName).toBe(activePersona.fullName);

      fillPage(retainedInStep3!, options, step3Container);

      const rollInput = document.getElementById('s3_roll') as HTMLInputElement;
      const schoolInput = document.getElementById('s3_school') as HTMLInputElement;
      const guardianInput = document.getElementById('s3_guardian') as HTMLInputElement;

      expect(rollInput.value).toBe(activePersona.studentId);
      expect(schoolInput.value).toBe(activePersona.school);
      expect(guardianInput.value).toBe(activePersona.guardianName);
    });

    it('updates session persona when regeneration is triggered', () => {
      const initialPerson = generateSyntheticPerson('employee');
      setSessionPersona(initialPerson);
      expect(getSessionPersona()?.fullName).toBe(initialPerson.fullName);

      const regeneratedPerson = generateSyntheticPerson('employee');
      setSessionPersona(regeneratedPerson);

      const current = getSessionPersona();
      expect(current?.fullName).toBe(regeneratedPerson.fullName);
      expect(current?.employeeId).toBe(regeneratedPerson.employeeId);
    });
  });
});
