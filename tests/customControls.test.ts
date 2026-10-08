import { describe, it, expect, beforeEach } from 'vitest';
import { fillPage, getFieldValue } from '../src/content/filler';
import { generateSyntheticPerson } from '../src/generator/personGenerator';
import { FillOptions } from '../src/types';

describe('Phase 7 — Custom Form Controls & Specialized Field Filling', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  const defaultOptions: FillOptions = {
    profile: 'general',
    fillCategories: {
      personal: true,
      contact: true,
      address: true,
      professional: true,
    },
  };

  it('correctly maps specialized field values from SyntheticPerson', () => {
    const student = generateSyntheticPerson('student');
    expect(getFieldValue('studentId', student)).toBe(student.studentId);
    expect(getFieldValue('school', student)).toBe(student.school);
    expect(getFieldValue('faculty', student)).toBe(student.faculty);
    expect(getFieldValue('grade', student)).toBe(student.grade);
    expect(getFieldValue('guardianName', student)).toBe(student.guardianName);
    expect(getFieldValue('guardianPhone', student)).toBe(student.guardianPhone);

    const emp = generateSyntheticPerson('employee');
    expect(getFieldValue('employeeId', emp)).toBe(emp.employeeId);
    expect(getFieldValue('salary', emp)).toBe(emp.salary);
    expect(getFieldValue('panNumber', emp)).toBe(emp.panNumber);

    const farmer = generateSyntheticPerson('farmer');
    expect(getFieldValue('cropType', farmer)).toBe(farmer.cropType);
    expect(getFieldValue('cooperative', farmer)).toBe(farmer.cooperative);

    expect(getFieldValue('dateOfBirthBS', student)).toBe(student.dateOfBirthBS);
  });

  it('fills custom ARIA checkboxes with role="checkbox"', () => {
    container.innerHTML = `
      <form id="test-form">
        <div role="checkbox" aria-checked="false" id="agree-terms" aria-label="I agree to Terms & Conditions"></div>
      </form>
    `;

    const customCheckbox = container.querySelector('#agree-terms') as HTMLElement;
    let clicked = false;
    customCheckbox.addEventListener('click', () => {
      clicked = true;
    });

    const person = generateSyntheticPerson('general');
    const result = fillPage(person, defaultOptions, container);

    expect(result.success).toBe(true);
    expect(customCheckbox.getAttribute('aria-checked')).toBe('true');
    expect(clicked).toBe(true);
  });

  it('fills custom ARIA radio buttons for gender selection', () => {
    container.innerHTML = `
      <form id="gender-form">
        <label>Select Gender</label>
        <div role="radio" aria-checked="false" id="radio-male" value="male" aria-label="Gender Male">Male</div>
        <div role="radio" aria-checked="false" id="radio-female" value="female" aria-label="Gender Female">Female</div>
      </form>
    `;

    const maleRadio = container.querySelector('#radio-male') as HTMLElement;
    const femaleRadio = container.querySelector('#radio-female') as HTMLElement;

    const person = generateSyntheticPerson('general', 'Female');
    const result = fillPage(person, defaultOptions, container);

    expect(result.success).toBe(true);
    expect(femaleRadio.getAttribute('aria-checked')).toBe('true');
    expect(maleRadio.getAttribute('aria-checked')).toBe('false');
  });

  it('populates custom Combobox / Autocomplete dropdown inputs', () => {
    container.innerHTML = `
      <form id="search-form">
        <label for="district-search">District</label>
        <input role="combobox" aria-autocomplete="list" id="district-search" name="district" />
      </form>
    `;

    const combobox = container.querySelector('#district-search') as HTMLInputElement;
    let keydownTriggered = false;
    combobox.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') keydownTriggered = true;
    });

    const person = generateSyntheticPerson('general');
    const result = fillPage(person, defaultOptions, container);

    expect(result.success).toBe(true);
    expect(combobox.value).toBe(person.address.district);
    expect(keydownTriggered).toBe(true);
  });
});
