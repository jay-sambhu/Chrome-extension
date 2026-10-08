import { describe, it, expect, beforeEach } from 'vitest';
import {
  BLOOD_GROUPS,
  BLOOD_GROUPS_DEVANAGARI,
  generateRandomBloodGroup,
} from '../src/generator/bloodGroup';
import { generateSyntheticPerson } from '../src/generator/personGenerator';
import { detectFieldType } from '../src/content/detector';
import { fillPage, matchesBloodGroupText } from '../src/content/filler';
import { BloodGroup } from '../src/types';

describe('Phase 1.6 — Blood Group Field Support', () => {
  describe('Blood Group Generator & Metadata', () => {
    it('contains all 8 ABO and Rh blood group types', () => {
      expect(BLOOD_GROUPS).toHaveLength(8);
      const expected: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
      for (const group of expected) {
        expect(BLOOD_GROUPS).toContain(group);
      }
    });

    it('contains authentic Devanagari representations for all 8 blood groups', () => {
      for (const group of BLOOD_GROUPS) {
        const np = BLOOD_GROUPS_DEVANAGARI[group];
        expect(np).toBeDefined();
        expect(typeof np).toBe('string');
        expect(np).toContain(`(${group})`);
        expect(/पोजेटिभ|नेगेटिभ/.test(np)).toBe(true);
      }
    });

    it('generateRandomBloodGroup returns a valid BloodGroup across multiple calls', () => {
      for (let i = 0; i < 50; i++) {
        const bg = generateRandomBloodGroup();
        expect(BLOOD_GROUPS).toContain(bg);
      }
    });

    it('generateSyntheticPerson automatically attaches bloodGroup and devanagari.bloodGroup', () => {
      const person = generateSyntheticPerson();
      expect(person.bloodGroup).toBeDefined();
      expect(BLOOD_GROUPS).toContain(person.bloodGroup);

      expect(person.devanagari).toBeDefined();
      expect(person.devanagari?.bloodGroup).toBe(BLOOD_GROUPS_DEVANAGARI[person.bloodGroup!]);
    });
  });

  describe('Blood Group Text & Radio Matching Engine', () => {
    it('accurately matches exact codes and variations without cross-matching A/B into AB', () => {
      expect(matchesBloodGroupText('A+', 'A+')).toBe(true);
      expect(matchesBloodGroupText('A Positive', 'A+')).toBe(true);
      expect(matchesBloodGroupText('A_POS', 'A+')).toBe(true);
      expect(matchesBloodGroupText('ए पोजेटिभ (A+)', 'A+')).toBe(true);

      // Must not match AB when searching for A
      expect(matchesBloodGroupText('AB+', 'A+')).toBe(false);
      expect(matchesBloodGroupText('AB Positive', 'A+')).toBe(false);

      // Must not match AB when searching for B
      expect(matchesBloodGroupText('AB-', 'B-')).toBe(false);
      expect(matchesBloodGroupText('B Negative', 'B-')).toBe(true);
      expect(matchesBloodGroupText('B_NEG', 'B-')).toBe(true);

      // Rh sign check
      expect(matchesBloodGroupText('O Positive', 'O-')).toBe(false);
      expect(matchesBloodGroupText('O Negative', 'O-')).toBe(true);
      expect(matchesBloodGroupText('O-', 'O-')).toBe(true);
      expect(matchesBloodGroupText('ओ नेगेटिभ (O-)', 'O-')).toBe(true);
    });
  });

  describe('Field Detector for Blood Group', () => {
    beforeEach(() => {
      document.body.innerHTML = '';
    });

    it('detects English text input for blood group by name and id', () => {
      const input = document.createElement('input');
      input.type = 'text';
      input.name = 'blood_group';
      document.body.appendChild(input);

      const detected = detectFieldType(input);
      expect(detected.type).toBe('bloodGroup');
      expect(detected.confidence).toBeGreaterThanOrEqual(0.55);
    });

    it('detects Devanagari label for blood group', () => {
      const label = document.createElement('label');
      label.textContent = 'रक्त समूह (Blood Group):';
      const input = document.createElement('input');
      input.type = 'text';
      label.appendChild(input);
      document.body.appendChild(label);

      const detected = detectFieldType(input);
      expect(detected.type).toBe('bloodGroup');
      expect(detected.script).toBe('np');
    });

    it('detects select element by inspecting blood group options', () => {
      const select = document.createElement('select');
      select.name = 'medical_info_field';
      select.innerHTML = `
        <option value="">-- Choose Option --</option>
        <option value="A+">A Positive</option>
        <option value="B+">B Positive</option>
        <option value="O+">O Positive</option>
        <option value="AB+">AB Positive</option>
      `;
      document.body.appendChild(select);

      const detected = detectFieldType(select);
      expect(detected.type).toBe('bloodGroup');
      expect(detected.confidence).toBeGreaterThanOrEqual(0.9);
    });

    it('detects radio button group wrapped in a fieldset with legend', () => {
      const fieldset = document.createElement('fieldset');
      fieldset.innerHTML = `
        <legend>Blood Group / रक्त समूह</legend>
        <label><input type="radio" name="bg" value="A+"> A+</label>
        <label><input type="radio" name="bg" value="B+"> B+</label>
        <label><input type="radio" name="bg" value="O+"> O+</label>
      `;
      document.body.appendChild(fieldset);

      const radios = fieldset.querySelectorAll('input');
      radios.forEach((r) => {
        const detected = detectFieldType(r);
        expect(detected.type).toBe('bloodGroup');
      });
    });
  });

  describe('Form Auto-Filler for Blood Group', () => {
    beforeEach(() => {
      document.body.innerHTML = '';
    });

    it('fills select dropdown with matching blood group option', () => {
      const form = document.createElement('form');
      form.innerHTML = `
        <label for="blood_group">Blood Group</label>
        <select id="blood_group" name="blood_group">
          <option value="">Select Blood Group</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
        </select>
      `;
      document.body.appendChild(form);

      const person = generateSyntheticPerson();
      person.bloodGroup = 'B+';

      const result = fillPage(person, {
        fillCategories: { personal: true, contact: true, address: true, professional: true },
        profile: 'general',
        script: 'en',
      });

      const select = document.getElementById('blood_group') as HTMLSelectElement;
      expect(select.value).toBe('B+');
      expect(result.fieldsFilledCount).toBeGreaterThanOrEqual(1);
    });

    it('fills select dropdown with Devanagari labels and values', () => {
      const form = document.createElement('form');
      form.innerHTML = `
        <label for="blood_group_np">रक्त समूह छान्नुहोस्</label>
        <select id="blood_group_np" name="blood_group_np">
          <option value="">छान्नुहोस्</option>
          <option value="ए पोजेटिभ (A+)">ए पोजेटिभ (A+)</option>
          <option value="बी पोजेटिभ (B+)">बी पोजेटिभ (B+)</option>
          <option value="ओ पोजेटिभ (O+)">ओ पोजेटिभ (O+)</option>
          <option value="एबी पोजेटिभ (AB+)">एबी पोजेटिभ (AB+)</option>
        </select>
      `;
      document.body.appendChild(form);

      const person = generateSyntheticPerson();
      person.bloodGroup = 'O+';
      person.devanagari!.bloodGroup = 'ओ पोजेटिभ (O+)';

      fillPage(person, {
        fillCategories: { personal: true, contact: true, address: true, professional: true },
        profile: 'general',
        script: 'np',
      });

      const select = document.getElementById('blood_group_np') as HTMLSelectElement;
      expect(select.value).toBe('ओ पोजेटिभ (O+)');
    });

    it('checks the correct HTML5 radio button in a blood group radio group', () => {
      const form = document.createElement('form');
      form.innerHTML = `
        <fieldset>
          <legend>Blood Group</legend>
          <label><input type="radio" name="blood_group" value="A+" id="bg_a_pos"> A+</label>
          <label><input type="radio" name="blood_group" value="B+" id="bg_b_pos"> B+</label>
          <label><input type="radio" name="blood_group" value="O+" id="bg_o_pos"> O+</label>
          <label><input type="radio" name="blood_group" value="AB+" id="bg_ab_pos"> AB+</label>
        </fieldset>
      `;
      document.body.appendChild(form);

      const person = generateSyntheticPerson();
      person.bloodGroup = 'AB+';

      const result = fillPage(person, {
        fillCategories: { personal: true, contact: true, address: true, professional: true },
        profile: 'general',
        script: 'en',
      });

      const radioAB = document.getElementById('bg_ab_pos') as HTMLInputElement;
      const radioO = document.getElementById('bg_o_pos') as HTMLInputElement;

      expect(radioAB.checked).toBe(true);
      expect(radioO.checked).toBe(false);
      expect(result.fieldsFilledCount).toBeGreaterThanOrEqual(1);
    });

    it('activates custom ARIA radio button for blood group', () => {
      const container = document.createElement('div');
      container.className = 'blood-group-selector';
      container.innerHTML = `
        <label id="bg_label">Select Blood Type</label>
        <div role="radiogroup" aria-labelledby="bg_label">
          <div role="radio" id="aria_bg_a" value="A+">A+</div>
          <div role="radio" id="aria_bg_b" value="B+">B+</div>
          <div role="radio" id="aria_bg_o" value="O+">O+</div>
        </div>
      `;
      document.body.appendChild(container);

      const person = generateSyntheticPerson();
      person.bloodGroup = 'O+';

      fillPage(person, {
        fillCategories: { personal: true, contact: true, address: true, professional: true },
        profile: 'general',
        script: 'en',
      });

      const radioO = document.getElementById('aria_bg_o');
      const radioA = document.getElementById('aria_bg_a');

      expect(radioO?.getAttribute('aria-checked')).toBe('true');
      expect(radioA?.getAttribute('aria-checked')).toBeNull();
    });

    it('does not fill blood group if personal category is disabled', () => {
      const form = document.createElement('form');
      form.innerHTML = `
        <select id="blood_group" name="blood_group">
          <option value="">Select</option>
          <option value="A+">A+</option>
          <option value="O+">O+</option>
        </select>
      `;
      document.body.appendChild(form);

      const person = generateSyntheticPerson();
      person.bloodGroup = 'A+';

      const result = fillPage(person, {
        fillCategories: { personal: false, contact: true, address: true, professional: false },
        profile: 'general',
        script: 'en',
      });

      const select = document.getElementById('blood_group') as HTMLSelectElement;
      expect(select.value).toBe('');
      expect(result.fieldsFilledCount).toBe(0);
    });
  });
});
