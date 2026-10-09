import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  BUILTIN_PERSONA_PRESETS,
  getPersonaPresets,
  getPersonaPresetById,
  savePersonaPreset,
  deletePersonaPreset,
  resetDefaultPresets,
  generatePersonFromPreset,
} from '../src/services/personaPresets';
import { PersonaPreset } from '../src/types';

describe('Phase 4.1 Custom Persona Presets Engine', () => {
  let fakeStorage: Record<string, any> = {};

  beforeEach(() => {
    fakeStorage = {};

    // Mock chrome.storage.local
    (globalThis as any).chrome = {
      storage: {
        local: {
          get: vi.fn(async (keys: string[]) => {
            const result: Record<string, any> = {};
            for (const key of keys) {
              if (fakeStorage[key] !== undefined) {
                result[key] = fakeStorage[key];
              }
            }
            return result;
          }),
          set: vi.fn(async (items: Record<string, any>) => {
            Object.assign(fakeStorage, items);
          }),
        },
      },
    };
  });

  describe('Built-in Presets Definition', () => {
    it('provides all 3 core built-in presets: QA SuperAdmin, Biratnagar Retailer, and Pokhara Foreign Student', () => {
      const ids = BUILTIN_PERSONA_PRESETS.map((p) => p.id);
      expect(ids).toContain('qa-superadmin');
      expect(ids).toContain('biratnagar-retailer');
      expect(ids).toContain('pokhara-foreign-student');

      const qaAdmin = BUILTIN_PERSONA_PRESETS.find((p) => p.id === 'qa-superadmin');
      expect(qaAdmin?.name).toBe('QA SuperAdmin');
      expect(qaAdmin?.baseProfile).toBe('employee');
      expect(qaAdmin?.designation).toBe('QA Super Administrator');
      expect(qaAdmin?.emailDomain).toBe('superadmin.qa');
      expect(qaAdmin?.isBuiltin).toBe(true);

      const retailer = BUILTIN_PERSONA_PRESETS.find((p) => p.id === 'biratnagar-retailer');
      expect(retailer?.name).toBe('Biratnagar Retailer');
      expect(retailer?.baseProfile).toBe('business');
      expect(retailer?.province).toBe('Koshi Province');
      expect(retailer?.district).toBe('Morang');
      expect(retailer?.isBuiltin).toBe(true);

      const student = BUILTIN_PERSONA_PRESETS.find((p) => p.id === 'pokhara-foreign-student');
      expect(student?.name).toBe('Pokhara Foreign Student');
      expect(student?.baseProfile).toBe('student');
      expect(student?.province).toBe('Gandaki Province');
      expect(student?.district).toBe('Kaski');
      expect(student?.school).toBe('Prithvi Narayan Campus');
      expect(student?.isBuiltin).toBe(true);
    });
  });

  describe('Preset Storage & CRUD Operations', () => {
    it('initializes with built-in presets when storage is empty', async () => {
      const presets = await getPersonaPresets();
      expect(presets.length).toBeGreaterThanOrEqual(3);
      expect(fakeStorage.personaPresets).toBeDefined();
    });

    it('saves a new custom preset and generates unique ID', async () => {
      const created = await savePersonaPreset({
        name: 'Lalitpur Heritage Architect',
        baseProfile: 'employee',
        description: 'Architect specializing in Patan heritage restoration',
        province: 'Bagmati Province',
        district: 'Lalitpur',
        municipality: 'Lalitpur Metropolitan City',
        companyName: 'Patan Heritage Conservation Trust',
        designation: 'Senior Conservation Architect',
        emailDomain: 'heritage.np',
        bloodGroup: 'B+',
      });

      expect(created.id).toMatch(/^preset_/);
      expect(created.name).toBe('Lalitpur Heritage Architect');
      expect(created.isBuiltin).toBe(false);
      expect(created.createdAt).toBeGreaterThan(0);

      const all = await getPersonaPresets();
      expect(all.some((p) => p.id === created.id)).toBe(true);
    });

    it('updates an existing preset correctly', async () => {
      const initial = await savePersonaPreset({
        name: 'Chitwan Farmer Spec',
        baseProfile: 'farmer',
        cropType: 'Mustard Seeds',
      });

      const updated = await savePersonaPreset({
        id: initial.id,
        name: 'Chitwan Honey & Mustard Farmer',
        baseProfile: 'farmer',
        cropType: 'Honey & Organic Mustard',
      });

      expect(updated.id).toBe(initial.id);
      expect(updated.name).toBe('Chitwan Honey & Mustard Farmer');
      expect(updated.cropType).toBe('Honey & Organic Mustard');
    });

    it('retrieves preset by ID', async () => {
      const found = await getPersonaPresetById('qa-superadmin');
      expect(found).toBeDefined();
      expect(found?.name).toBe('QA SuperAdmin');

      const missing = await getPersonaPresetById('non-existent-id');
      expect(missing).toBeUndefined();
    });

    it('deletes custom presets, but prevents deleting built-in presets', async () => {
      // Attempt to delete built-in
      const deleteBuiltin = await deletePersonaPreset('qa-superadmin');
      expect(deleteBuiltin).toBe(false);

      const checkBuiltin = await getPersonaPresetById('qa-superadmin');
      expect(checkBuiltin).toBeDefined();

      // Create and delete custom preset
      const custom = await savePersonaPreset({
        name: 'Temporary QA Mock',
        baseProfile: 'general',
      });

      const deleteCustom = await deletePersonaPreset(custom.id);
      expect(deleteCustom).toBe(true);

      const checkCustom = await getPersonaPresetById(custom.id);
      expect(checkCustom).toBeUndefined();
    });

    it('resets presets back to default built-ins', async () => {
      await savePersonaPreset({
        name: 'Extra Preset To Be Wiped',
        baseProfile: 'student',
      });

      const resetList = await resetDefaultPresets();
      expect(resetList.length).toBe(BUILTIN_PERSONA_PRESETS.length);
      expect(resetList.every((p) => p.isBuiltin)).toBe(true);
    });
  });

  describe('Synthetic Person Generation from Presets', () => {
    it('generates a synthetic person adhering to QA SuperAdmin preset constraints', () => {
      const qaAdminPreset = BUILTIN_PERSONA_PRESETS.find((p) => p.id === 'qa-superadmin')!;
      const person = generatePersonFromPreset(qaAdminPreset);

      expect(person.profileType).toBe('employee');
      expect(person.designation).toBe('QA Super Administrator');
      expect(person.jobTitle).toBe('QA Super Administrator');
      expect(person.companyName).toBe('Nepal Enterprise QA Cloud');
      expect(person.department).toBe('Quality Assurance & Security');
      expect(person.email).toMatch(/@superadmin\.qa$/);
      expect(person.workEmail).toMatch(/@superadmin\.qa$/);
      expect(person.bloodGroup).toBe('O+');
      expect(person.bankName).toBe('Nabil Bank');
      expect(person.address.district).toBe('Kathmandu');
      expect(person.address.province).toBe('Bagmati Province');
      expect(person.telephone).toMatch(/^01-/); // Kathmandu landline prefix

      // Unicode Devanagari details should be in sync
      expect(person.devanagari).toBeDefined();
      expect(person.devanagari?.province).toBe('बागमती प्रदेश');
      expect(person.devanagari?.district).toBe('काठमाडौँ');
      expect(person.devanagari?.bloodGroup).toBe('ओ पोजेटिभ (O+)');
    });

    it('generates a synthetic person adhering to Biratnagar Retailer preset constraints', () => {
      const retailerPreset = BUILTIN_PERSONA_PRESETS.find((p) => p.id === 'biratnagar-retailer')!;
      const person = generatePersonFromPreset(retailerPreset);

      expect(person.profileType).toBe('business');
      expect(person.businessName).toBe('Birat Trade Syndicate');
      expect(person.businessType).toBe('Retail & FMCG Distribution');
      expect(person.address.province).toBe('Koshi Province');
      expect(person.address.district).toBe('Morang');
      expect(person.address.municipality).toContain('Biratnagar');
      expect(person.bankName).toBe('Global IME Bank');
      expect(person.telephone).toMatch(/^021-/); // Morang area code

      expect(person.devanagari?.province).toBe('कोशी प्रदेश');
      expect(person.devanagari?.district).toBe('मोरङ');
    });

    it('generates a synthetic person adhering to Pokhara Foreign Student preset constraints', () => {
      const studentPreset = BUILTIN_PERSONA_PRESETS.find((p) => p.id === 'pokhara-foreign-student')!;
      const person = generatePersonFromPreset(studentPreset);

      expect(person.profileType).toBe('student');
      expect(person.school).toBe('Prithvi Narayan Campus');
      expect(person.faculty).toBe('Science & Information Technology');
      expect(person.grade).toBe('Bachelor 3rd Year');
      expect(person.address.province).toBe('Gandaki Province');
      expect(person.address.district).toBe('Kaski');
      expect(person.telephone).toMatch(/^061-/); // Kaski area code

      expect(person.devanagari?.province).toBe('गण्डकी प्रदेश');
      expect(person.devanagari?.district).toBe('कास्की');
    });

    it('enforces forced gender constraint when specified in preset', () => {
      const femalePreset: PersonaPreset = {
        id: 'test-female',
        name: 'Female Officer',
        baseProfile: 'employee',
        gender: 'Female',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      for (let i = 0; i < 5; i++) {
        const person = generatePersonFromPreset(femalePreset);
        expect(person.gender).toBe('Female');
        expect(person.honorific).toMatch(/^(Mrs\.|Ms\.)$/);
      }
    });
  });
});
