import { describe, it, expect, beforeEach } from 'vitest';
import { detectFieldType, scanFormFields } from '../src/content/detector';

describe('Field Detection Engine', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('detects email fields accurately from type, name, placeholder, or label', () => {
    const input1 = document.createElement('input');
    input1.type = 'email';
    expect(detectFieldType(input1).type).toBe('email');

    const input2 = document.createElement('input');
    input2.setAttribute('name', 'user_email_address');
    expect(detectFieldType(input2).type).toBe('email');

    const container = document.createElement('div');
    container.innerHTML = `
      <label for="f-mail">Email ID</label>
      <input id="f-mail" type="text" />
    `;
    document.body.appendChild(container);
    const input3 = document.getElementById('f-mail')!;
    expect(detectFieldType(input3).type).toBe('email');
  });

  it('detects phone and mobile fields', () => {
    const input1 = document.createElement('input');
    input1.type = 'tel';
    expect(detectFieldType(input1).type).toBe('phone');

    const input2 = document.createElement('input');
    input2.setAttribute('placeholder', 'Enter Mobile Number');
    expect(detectFieldType(input2).type).toBe('phone');

    const input3 = document.createElement('input');
    input3.setAttribute('name', 'telephone_no');
    expect(detectFieldType(input3).type).toBe('telephone');
  });

  it('detects Nepal address components (Province, District, Municipality, Ward)', () => {
    const pInput = document.createElement('input');
    pInput.setAttribute('name', 'province');
    expect(detectFieldType(pInput).type).toBe('province');

    const dInput = document.createElement('input');
    dInput.setAttribute('placeholder', 'Select District');
    expect(detectFieldType(dInput).type).toBe('district');

    const mInput = document.createElement('input');
    mInput.setAttribute('name', 'nagarpalika');
    expect(detectFieldType(mInput).type).toBe('municipality');

    const wInput = document.createElement('input');
    wInput.setAttribute('name', 'ward_no');
    expect(detectFieldType(wInput).type).toBe('ward');
  });

  it('detects name fields (full, first, last)', () => {
    const fullInput = document.createElement('input');
    fullInput.setAttribute('placeholder', 'Your Full Name');
    expect(detectFieldType(fullInput).type).toBe('fullName');

    const fInput = document.createElement('input');
    fInput.setAttribute('name', 'fname');
    expect(detectFieldType(fInput).type).toBe('firstName');

    const lInput = document.createElement('input');
    lInput.setAttribute('name', 'lname');
    expect(detectFieldType(lInput).type).toBe('lastName');
  });

  it('scans and detects multiple form fields on a page', () => {
    document.body.innerHTML = `
      <form id="test-form">
        <input name="fullName" type="text" />
        <input name="email" type="email" />
        <input name="mobile" type="tel" />
        <input name="province" type="text" />
        <input type="hidden" name="csrf" value="secret" />
        <button type="submit">Submit</button>
      </form>
    `;

    const fields = scanFormFields();
    expect(fields.length).toBe(4); // Excludes hidden and submit
    expect(fields.map((f) => f.type)).toEqual(['fullName', 'email', 'phone', 'province']);
  });
});
