import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  captureFormSnapshot,
  revertForm,
  clearForm,
  fillPage,
  getLastSnapshot,
  clearSnapshot,
} from '../src/content/filler';
import { generateSyntheticPerson } from '../src/generator/personGenerator';

describe('Phase 2.1 — Undo / Clear Form Functionality', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    clearSnapshot();
  });

  describe('Form Snapshot Capture', () => {
    it('captures initial states of diverse form fields accurately', () => {
      const form = document.createElement('form');
      form.innerHTML = `
        <input type="text" name="full_name" id="name" value="Initial Name" />
        <textarea name="bio">Initial Bio</textarea>
        <input type="checkbox" name="terms" id="terms" checked />
        <input type="radio" name="gender" id="g_male" value="male" checked />
        <input type="radio" name="gender" id="g_female" value="female" />
        <select name="province" id="province">
          <option value="">Select</option>
          <option value="Bagmati Province" selected>Bagmati Province</option>
          <option value="Gandaki Province">Gandaki Province</option>
        </select>
        <div role="checkbox" id="aria_agree" aria-checked="true">I agree</div>
        <div role="radio" id="aria_blood" aria-checked="true" value="O+">O+</div>
      `;
      document.body.appendChild(form);

      const snapshot = captureFormSnapshot(form);
      expect(snapshot.fields.length).toBeGreaterThanOrEqual(7);

      const nameSnap = snapshot.fields.find((f) => f.element.id === 'name');
      expect(nameSnap?.value).toBe('Initial Name');

      const bioSnap = snapshot.fields.find((f) => f.type === 'textarea');
      expect(bioSnap?.value).toBe('Initial Bio');

      const termsSnap = snapshot.fields.find((f) => f.element.id === 'terms');
      expect(termsSnap?.checked).toBe(true);

      const maleRadioSnap = snapshot.fields.find((f) => f.element.id === 'g_male');
      expect(maleRadioSnap?.checked).toBe(true);

      const femaleRadioSnap = snapshot.fields.find((f) => f.element.id === 'g_female');
      expect(femaleRadioSnap?.checked).toBe(false);

      const selectSnap = snapshot.fields.find((f) => f.element.id === 'province');
      expect(selectSnap?.value).toBe('Bagmati Province');
      expect(selectSnap?.selectedIndex).toBe(1);

      const ariaCheckSnap = snapshot.fields.find((f) => f.element.id === 'aria_agree');
      expect(ariaCheckSnap?.ariaChecked).toBe('true');
    });
  });

  describe('Form Fill and Snapshot Reversion (Undo)', () => {
    it('automatically takes a snapshot on fillPage and restores pre-existing values', () => {
      const form = document.createElement('form');
      form.innerHTML = `
        <label for="name">Full Name</label>
        <input type="text" id="name" name="full_name" value="Preexisting Developer" />
        
        <label for="email">Email</label>
        <input type="email" id="email" name="email" value="preexisting@test.local" />

        <label for="phone">Phone</label>
        <input type="tel" id="phone" name="phone" value="" />
      `;
      document.body.appendChild(form);

      const inputName = document.getElementById('name') as HTMLInputElement;
      const inputEmail = document.getElementById('email') as HTMLInputElement;
      const inputPhone = document.getElementById('phone') as HTMLInputElement;

      const person = generateSyntheticPerson('general');

      // Fill page
      const fillResult = fillPage(person, {
        profile: 'general',
        fillScript: 'en',
        fillCategories: { personal: true, contact: true, address: true, professional: true },
      }, form);

      expect(fillResult.fieldsFilledCount).toBeGreaterThanOrEqual(2);
      expect(inputName.value).toBe(person.fullName);
      expect(inputEmail.value).toBe(person.email);
      expect(inputPhone.value).toBe(person.phone);

      // Verify that snapshot was automatically captured and stored
      expect(getLastSnapshot()).not.toBeNull();

      // Track change/input events during revert
      const inputSpy = vi.fn();
      const changeSpy = vi.fn();
      inputName.addEventListener('input', inputSpy);
      inputName.addEventListener('change', changeSpy);

      // Revert form
      const undoResult = revertForm(form);
      expect(undoResult.success).toBe(true);
      expect(undoResult.action).toBe('reverted');
      expect(undoResult.revertedCount).toBeGreaterThanOrEqual(2);

      // Pre-existing values should be cleanly restored!
      expect(inputName.value).toBe('Preexisting Developer');
      expect(inputEmail.value).toBe('preexisting@test.local');
      expect(inputPhone.value).toBe('');

      // Events should have been dispatched
      expect(inputSpy).toHaveBeenCalled();
      expect(changeSpy).toHaveBeenCalled();
    });

    it('reverts radio buttons, checkboxes, and select dropdowns back to initial state', () => {
      const form = document.createElement('form');
      form.innerHTML = `
        <fieldset>
          <legend>Gender</legend>
          <label><input type="radio" name="gender" id="rad_male" value="male"> Male</label>
          <label><input type="radio" name="gender" id="rad_female" value="female"> Female</label>
        </fieldset>

        <label><input type="checkbox" name="sameAsPermanent" id="same_perm"> Same as Permanent</label>

        <label for="province">Province</label>
        <select id="province" name="province">
          <option value="">-- Choose Province --</option>
          <option value="Bagmati Province">Bagmati Province</option>
          <option value="Gandaki Province">Gandaki Province</option>
          <option value="Koshi Province">Koshi Province</option>
        </select>
      `;
      document.body.appendChild(form);

      const radMale = document.getElementById('rad_male') as HTMLInputElement;
      const radFemale = document.getElementById('rad_female') as HTMLInputElement;
      const samePerm = document.getElementById('same_perm') as HTMLInputElement;
      const selectProvince = document.getElementById('province') as HTMLSelectElement;

      // Ensure initially blank / unselected
      expect(radMale.checked).toBe(false);
      expect(radFemale.checked).toBe(false);
      expect(samePerm.checked).toBe(false);
      expect(selectProvince.value).toBe('');

      const person = generateSyntheticPerson('general');
      person.gender = 'Female';
      person.address.province = 'Gandaki Province';

      // Fill page
      fillPage(person, {
        profile: 'general',
        fillScript: 'en',
        fillCategories: { personal: true, contact: true, address: true, professional: true },
      }, form);

      expect(radFemale.checked).toBe(true);
      expect(selectProvince.value).toBe('Gandaki Province');

      // Revert form
      const undoResult = revertForm(form);
      expect(undoResult.success).toBe(true);
      expect(undoResult.action).toBe('reverted');

      // Form should be back to initial unselected state
      expect(radMale.checked).toBe(false);
      expect(radFemale.checked).toBe(false);
      expect(samePerm.checked).toBe(false);
      expect(selectProvince.value).toBe('');
      expect(selectProvince.selectedIndex).toBe(0);
    });

    it('reverts custom ARIA checkboxes and radio controls', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <div role="radiogroup" aria-label="Gender">
          <div role="radio" id="aria_male" value="male" aria-checked="false">Male</div>
          <div role="radio" id="aria_female" value="female" aria-checked="false">Female</div>
        </div>
        <div role="checkbox" id="aria_terms" aria-checked="false">Agree</div>
      `;
      document.body.appendChild(container);

      const person = generateSyntheticPerson('general');
      person.gender = 'Male';

      fillPage(person, {
        profile: 'general',
        fillScript: 'en',
        fillCategories: { personal: true, contact: true, address: true, professional: true },
      }, container);

      const ariaMale = document.getElementById('aria_male');
      expect(ariaMale?.getAttribute('aria-checked')).toBe('true');

      // Revert
      revertForm(container);
      expect(ariaMale?.getAttribute('aria-checked')).toBe('false');
    });
  });

  describe('Clear Form Fallback Engine', () => {
    it('gracefully clears all form fields when no prior snapshot exists', () => {
      const form = document.createElement('form');
      form.innerHTML = `
        <input type="text" id="f_name" value="Stray Name" />
        <textarea id="f_desc">Some description</textarea>
        <input type="checkbox" id="f_check" checked />
        <input type="radio" id="f_radio" checked />
        <select id="f_select">
          <option value="1">Option 1</option>
          <option value="2" selected>Option 2</option>
        </select>
      `;
      document.body.appendChild(form);

      // Snapshot is null
      expect(getLastSnapshot()).toBeNull();

      const clearResult = revertForm(form);
      expect(clearResult.success).toBe(true);
      expect(clearResult.action).toBe('cleared');
      expect(clearResult.revertedCount).toBeGreaterThanOrEqual(4);

      const name = document.getElementById('f_name') as HTMLInputElement;
      const desc = document.getElementById('f_desc') as HTMLTextAreaElement;
      const check = document.getElementById('f_check') as HTMLInputElement;
      const radio = document.getElementById('f_radio') as HTMLInputElement;
      const select = document.getElementById('f_select') as HTMLSelectElement;

      expect(name.value).toBe('');
      expect(desc.value).toBe('');
      expect(check.checked).toBe(false);
      expect(radio.checked).toBe(false);
      expect(select.selectedIndex).toBe(0);
    });

    it('clearForm explicitly clears populated forms', () => {
      const form = document.createElement('form');
      form.innerHTML = `
        <input type="text" id="name" value="Hari Bahadur" />
        <input type="checkbox" id="agree" checked />
        <div role="checkbox" id="aria_box" aria-checked="true">Custom</div>
      `;
      document.body.appendChild(form);

      const result = clearForm(form);
      expect(result.success).toBe(true);
      expect(result.action).toBe('cleared');

      const name = document.getElementById('name') as HTMLInputElement;
      const agree = document.getElementById('agree') as HTMLInputElement;
      const ariaBox = document.getElementById('aria_box');

      expect(name.value).toBe('');
      expect(agree.checked).toBe(false);
      expect(ariaBox?.hasAttribute('aria-checked')).toBe(false);
    });
  });
});
