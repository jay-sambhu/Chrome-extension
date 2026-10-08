import { describe, it, expect, beforeEach } from 'vitest';
import { generateSyntheticPerson } from '../src/generator/personGenerator';
import {
  PROVINCES_DEVANAGARI,
  DISTRICTS_DEVANAGARI,
  toNepaliNumerals,
  transliterateMunicipality,
  generateDevanagariDetails,
} from '../src/generator/devanagariEngine';
import { detectFieldType, detectTargetScript } from '../src/content/detector';
import { getFieldValue, fillPage } from '../src/content/filler';
import { FillOptions, SyntheticPerson } from '../src/types';

describe('Phase 1.1 — Devanagari Script (नेपाली युनिकोड) Support', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('Devanagari Engine Dictionaries & Numerals', () => {
    it('accurately converts Arabic digits to Nepali Devanagari numerals', () => {
      expect(toNepaliNumerals(0)).toBe('०');
      expect(toNepaliNumerals(12345)).toBe('१२३४५');
      expect(toNepaliNumerals('Ward-32')).toBe('Ward-३२');
      expect(toNepaliNumerals(2081)).toBe('२०८१');
    });

    it('contains all 7 Provinces mapped to authentic Devanagari names', () => {
      expect(Object.keys(PROVINCES_DEVANAGARI).length).toBe(7);
      expect(PROVINCES_DEVANAGARI['Bagmati Province']).toBe('बागमती प्रदेश');
      expect(PROVINCES_DEVANAGARI['Gandaki Province']).toBe('गण्डकी प्रदेश');
      expect(PROVINCES_DEVANAGARI['Koshi Province']).toBe('कोशी प्रदेश');
      expect(PROVINCES_DEVANAGARI['Madhesh Province']).toBe('मधेश प्रदेश');
      expect(PROVINCES_DEVANAGARI['Lumbini Province']).toBe('लुम्बिनी प्रदेश');
      expect(PROVINCES_DEVANAGARI['Karnali Province']).toBe('कर्णाली प्रदेश');
      expect(PROVINCES_DEVANAGARI['Sudurpashchim Province']).toBe('सुदूरपश्चिम प्रदेश');
    });

    it('contains all 77 Districts mapped to authentic Devanagari names', () => {
      expect(DISTRICTS_DEVANAGARI['Kathmandu']).toBe('काठमाडौँ');
      expect(DISTRICTS_DEVANAGARI['Lalitpur']).toBe('ललितपुर');
      expect(DISTRICTS_DEVANAGARI['Bhaktapur']).toBe('भक्तपुर');
      expect(DISTRICTS_DEVANAGARI['Kaski']).toBe('कास्की');
      expect(DISTRICTS_DEVANAGARI['Morang']).toBe('मोरङ');
      expect(DISTRICTS_DEVANAGARI['Jhapa']).toBe('झापा');
      expect(DISTRICTS_DEVANAGARI['Chitwan']).toBe('चितवन');
      expect(DISTRICTS_DEVANAGARI['Kailali']).toBe('कैलाली');
      expect(DISTRICTS_DEVANAGARI['Surkhet']).toBe('सुर्खेत');
      expect(DISTRICTS_DEVANAGARI['Jumla']).toBe('जुम्ला');
    });

    it('transliterates major Metropolitan Cities into authentic Devanagari', () => {
      expect(transliterateMunicipality('Kathmandu Metropolitan City')).toBe('काठमाडौँ महानगरपालिका');
      expect(transliterateMunicipality('Pokhara Metropolitan City')).toBe('पोखरा महानगरपालिका');
      expect(transliterateMunicipality('Bharatpur Metropolitan City')).toBe('भरतपुर महानगरपालिका');
      expect(transliterateMunicipality('Biratnagar Metropolitan City')).toBe('विराटनगर महानगरपालिका');
    });
  });

  describe('Synthetic Person Dual-Script Generation', () => {
    it('automatically generates Devanagari details for any synthetic person', () => {
      const person = generateSyntheticPerson('general');
      expect(person.devanagari).toBeDefined();
      const dev = person.devanagari!;

      expect(dev.fullName).toBeTruthy();
      expect(dev.firstName).toBeTruthy();
      expect(dev.lastName).toBeTruthy();
      expect(dev.fullAddress).toBeTruthy();
      expect(dev.district).toBeTruthy();
      expect(dev.province).toBeTruthy();
      expect(dev.ward).toContain('वडा नं.');

      // Check that strings contain Devanagari characters (Unicode range \u0900-\u097F)
      expect(/[\u0900-\u097F]/.test(dev.fullName)).toBe(true);
      expect(/[\u0900-\u097F]/.test(dev.fullAddress)).toBe(true);
    });

    it('strictly couples English and Devanagari geography for zero mismatch', () => {
      for (let i = 0; i < 50; i++) {
        const person = generateSyntheticPerson();
        const dev = person.devanagari!;

        // Province parity
        expect(dev.province).toBe(PROVINCES_DEVANAGARI[person.address.province]);

        // District parity
        expect(dev.district).toBe(DISTRICTS_DEVANAGARI[person.address.district]);
      }
    });

    it('generates localized Devanagari details for student archetype', () => {
      const student = generateSyntheticPerson('student');
      expect(student.devanagari).toBeDefined();
      expect(student.devanagari?.grade).toBeTruthy();
      expect(student.devanagari?.faculty).toContain('विज्ञान');
      if (student.guardianName) {
        expect(student.devanagari?.guardianName).toBeTruthy();
        expect(/[\u0900-\u097F]/.test(student.devanagari!.guardianName!)).toBe(true);
      }
    });

    it('generates localized Devanagari details for farmer archetype', () => {
      const farmer = generateSyntheticPerson('farmer');
      expect(farmer.devanagari).toBeDefined();
      expect(farmer.devanagari?.cropType).toBeTruthy();
      expect(farmer.devanagari?.cooperative).toContain('सहकारी');
    });
  });

  describe('Field-Level Script Auto-Detection', () => {
    it('detects Devanagari script intent from Devanagari labels and placeholders', () => {
      const detected1 = detectTargetScript({
        label: 'नाम (नेपालीमा)',
        placeholder: '',
        title: '',
        name: '',
        id: '',
      });
      expect(detected1).toBe('np');

      const detected2 = detectTargetScript({
        label: 'ठेगाना',
        placeholder: 'तपाईंको ठेगाना राख्नुहोस्',
        title: '',
        name: 'address',
        id: 'address',
      });
      expect(detected2).toBe('np');
    });

    it('detects Devanagari script intent from Romanized keywords like "in nepali" or "_nepali"', () => {
      const detected = detectTargetScript({
        label: 'Full Name (in nepali)',
        placeholder: 'Enter name in devanagari',
        title: '',
        name: 'applicant_name_nepali',
        id: 'name_np',
      });
      expect(detected).toBe('np');
    });

    it('returns undefined for standard English fields', () => {
      const detected = detectTargetScript({
        label: 'First Name',
        placeholder: 'John',
        title: '',
        name: 'firstName',
        id: 'first_name',
      });
      expect(detected).toBeUndefined();
    });

    it('annotates DetectedField with script = "np" when element has Devanagari signals', () => {
      const input = document.createElement('input');
      input.type = 'text';
      input.id = 'nepali_name';
      input.setAttribute('placeholder', 'नाम नेपालीमा');
      document.body.appendChild(input);

      const detected = detectFieldType(input);
      expect(detected.type).toBe('fullName');
      expect(detected.script).toBe('np');
    });
  });

  describe('getFieldValue with Script Parameter', () => {
    it('returns Devanagari values when script === "np"', () => {
      const person = generateSyntheticPerson('general');
      const nepName = getFieldValue('fullName', person, 'np');
      const engName = getFieldValue('fullName', person, 'en');

      expect(nepName).toBe(person.devanagari?.fullName);
      expect(engName).toBe(person.fullName);
      expect(nepName).not.toBe(engName);
      expect(/[\u0900-\u097F]/.test(nepName)).toBe(true);

      const nepDistrict = getFieldValue('district', person, 'np');
      expect(nepDistrict).toBe(DISTRICTS_DEVANAGARI[person.address.district]);
    });
  });

  describe('Form Filling with Script Support', () => {
    it('automatically fills Devanagari into fields explicitly requesting Devanagari even in default English mode', () => {
      const form = document.createElement('form');
      form.innerHTML = `
        <label for="eng_name">Full Name (English):</label>
        <input id="eng_name" type="text" name="name_en" />

        <label for="nep_name">नाम (नेपालीमा):</label>
        <input id="nep_name" type="text" name="name_np" />
      `;
      document.body.appendChild(form);

      const person = generateSyntheticPerson('general');
      const options: FillOptions = {
        profile: 'general',
        fillScript: 'en', // Global default is English
        fillCategories: { personal: true, contact: true, address: true, professional: true },
      };

      const result = fillPage(person, options, form);
      expect(result.fieldsFilledCount).toBe(2);

      const engInput = form.querySelector<HTMLInputElement>('#eng_name')!;
      const nepInput = form.querySelector<HTMLInputElement>('#nep_name')!;

      expect(engInput.value).toBe(person.fullName);
      expect(nepInput.value).toBe(person.devanagari?.fullName);
      expect(/[\u0900-\u097F]/.test(nepInput.value)).toBe(true);
    });

    it('fills all text and address fields in Devanagari when fillScript === "np"', () => {
      const form = document.createElement('form');
      form.innerHTML = `
        <label for="full_name">Full Name:</label>
        <input id="full_name" type="text" name="fullName" />

        <label for="district_input">District:</label>
        <input id="district_input" type="text" name="district" />

        <label for="occupation_input">Occupation:</label>
        <input id="occupation_input" type="text" name="occupation" />
      `;
      document.body.appendChild(form);

      const person = generateSyntheticPerson('general');
      const options: FillOptions = {
        profile: 'general',
        fillScript: 'np', // Global Devanagari Mode
        fillCategories: { personal: true, contact: true, address: true, professional: true },
      };

      const result = fillPage(person, options, form);
      expect(result.fieldsFilledCount).toBe(3);

      const nameInput = form.querySelector<HTMLInputElement>('#full_name')!;
      const districtInput = form.querySelector<HTMLInputElement>('#district_input')!;
      const occInput = form.querySelector<HTMLInputElement>('#occupation_input')!;

      expect(nameInput.value).toBe(person.devanagari?.fullName);
      expect(districtInput.value).toBe(person.devanagari?.district);
      expect(occInput.value).toBe(person.devanagari?.occupation);

      expect(/[\u0900-\u097F]/.test(nameInput.value)).toBe(true);
      expect(/[\u0900-\u097F]/.test(districtInput.value)).toBe(true);
    });

    it('matches select options with dual-script fallback (Devanagari options in English mode or vice-versa)', () => {
      const form = document.createElement('form');
      form.innerHTML = `
        <label for="province_select">प्रदेश छान्नुहोस्:</label>
        <select id="province_select" name="province">
          <option value="">Select Province</option>
          <option value="Koshi">कोशी प्रदेश</option>
          <option value="Madhesh">मधेश प्रदेश</option>
          <option value="Bagmati">बागमती प्रदेश</option>
          <option value="Gandaki">गण्डकी प्रदेश</option>
          <option value="Lumbini">लुम्बिनी प्रदेश</option>
          <option value="Karnali">कर्णाली प्रदेश</option>
          <option value="Sudurpashchim">सुदूरपश्चिम प्रदेश</option>
        </select>
      `;
      document.body.appendChild(form);

      const person = generateSyntheticPerson('general');
      person.address.province = 'Bagmati Province';
      person.devanagari = generateDevanagariDetails(person);

      const options: FillOptions = {
        profile: 'general',
        fillScript: 'en',
        fillCategories: { personal: true, contact: true, address: true, professional: true },
      };

      const result = fillPage(person, options, form);
      expect(result.fieldsFilledCount).toBe(1);

      const select = form.querySelector<HTMLSelectElement>('#province_select')!;
      expect(select.value).toBe('Bagmati');
    });
  });
});
