import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fillPage, setNativeValue, setNativeChecked } from '../src/content/filler';
import { generateSyntheticPerson } from '../src/generator/personGenerator';
import { FillOptions } from '../src/types';

describe('Form Filler Engine', () => {
  const defaultOptions: FillOptions = {
    profile: 'general',
    fillCategories: {
      personal: true,
      contact: true,
      address: true,
      professional: true,
    },
  };

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('triggers React/framework compatible input and change events via setNativeValue', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);

    const onInput = vi.fn();
    const onChange = vi.fn();
    input.addEventListener('input', onInput);
    input.addEventListener('change', onChange);

    setNativeValue(input, 'Test Name');

    expect(input.value).toBe('Test Name');
    expect(onInput).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('triggers native click, change and input events via setNativeChecked', () => {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    document.body.appendChild(checkbox);

    const onChange = vi.fn();
    checkbox.addEventListener('change', onChange);

    setNativeChecked(checkbox, true);

    expect(checkbox.checked).toBe(true);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('fills an entire form with synthetic Nepali data', () => {
    document.body.innerHTML = `
      <form id="reg-form">
        <label for="name">Full Name</label>
        <input id="name" name="name" type="text" />

        <label for="email">Email</label>
        <input id="email" name="email" type="email" />

        <label for="phone">Phone</label>
        <input id="phone" name="phone" type="tel" />

        <label for="address">Address</label>
        <textarea id="address" name="address"></textarea>

        <label for="occupation">Occupation</label>
        <input id="occupation" name="occupation" type="text" />

        <label for="province">Province</label>
        <select id="province" name="province">
          <option value="">Select Province</option>
          <option value="Koshi Province">Koshi Province</option>
          <option value="Madhesh Province">Madhesh Province</option>
          <option value="Bagmati Province">Bagmati Province</option>
          <option value="Gandaki Province">Gandaki Province</option>
          <option value="Lumbini Province">Lumbini Province</option>
          <option value="Karnali Province">Karnali Province</option>
          <option value="Sudurpashchim Province">Sudurpashchim Province</option>
        </select>
      </form>
    `;

    const person = generateSyntheticPerson();
    const result = fillPage(person, defaultOptions);

    expect(result.success).toBe(true);
    expect(result.fieldsFilledCount).toBe(6);

    const nameInput = document.getElementById('name') as HTMLInputElement;
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const phoneInput = document.getElementById('phone') as HTMLInputElement;
    const addressInput = document.getElementById('address') as HTMLTextAreaElement;
    const occInput = document.getElementById('occupation') as HTMLInputElement;
    const provinceSelect = document.getElementById('province') as HTMLSelectElement;

    expect(nameInput.value).toBe(person.fullName);
    expect(emailInput.value).toBe(person.email);
    expect(phoneInput.value).toBe(person.phone);
    expect(addressInput.value).toBe(person.address.fullAddress);
    expect(occInput.value).toBe(person.occupation);
    expect(provinceSelect.value).toBe(person.address.province);
  });

  it('respects category exclusion options', () => {
    document.body.innerHTML = `
      <form>
        <input name="fullName" type="text" />
        <input name="email" type="email" />
        <input name="address" type="text" />
        <input name="occupation" type="text" />
      </form>
    `;

    const person = generateSyntheticPerson();
    const customOptions: FillOptions = {
      profile: 'general',
      fillCategories: {
        personal: true,
        contact: false,     // Skip contact
        address: false,     // Skip address
        professional: false // Skip professional
      },
    };

    const result = fillPage(person, customOptions);
    expect(result.fieldsFilledCount).toBe(1); // Only fullName filled
  });
});
