import { describe, it, expect, beforeEach } from 'vitest';
import { detectFieldType, scanFormFields } from '../src/content/detector';

describe('Phase 4 — Advanced Field Detection Engine', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('Multi-Signal Scoring & Autocomplete Precedence', () => {
    it('prioritizes standard autocomplete attributes', () => {
      const input = document.createElement('input');
      input.setAttribute('autocomplete', 'given-name');
      input.setAttribute('name', 'weird_id_123'); // ambiguous name
      const res = detectFieldType(input);
      expect(res.type).toBe('firstName');
      expect(res.confidence).toBeGreaterThanOrEqual(0.95);

      const emailInput = document.createElement('input');
      emailInput.setAttribute('autocomplete', 'email');
      expect(detectFieldType(emailInput).type).toBe('email');

      const provInput = document.createElement('input');
      provInput.setAttribute('autocomplete', 'address-level1');
      expect(detectFieldType(provInput).type).toBe('province');

      const distInput = document.createElement('input');
      distInput.setAttribute('autocomplete', 'address-level2');
      expect(detectFieldType(distInput).type).toBe('district');
    });

    it('accumulates higher confidence when label, name, and placeholder align', () => {
      const input = document.createElement('input');
      input.id = 'full-name-input';
      input.name = 'user_full_name';
      input.placeholder = 'Your Full Name';

      const label = document.createElement('label');
      label.htmlFor = 'full-name-input';
      label.textContent = 'Full Name';

      document.body.appendChild(label);
      document.body.appendChild(input);

      const res = detectFieldType(input);
      expect(res.type).toBe('fullName');
      expect(res.confidence).toBeGreaterThanOrEqual(0.9);
    });
  });

  describe('Romanized Nepali Field Detection', () => {
    it('detects name components in Romanized Nepali', () => {
      const fInput = document.createElement('input');
      fInput.name = 'pahilo_naam';
      expect(detectFieldType(fInput).type).toBe('firstName');

      const mInput = document.createElement('input');
      mInput.placeholder = 'Bichko Naam';
      expect(detectFieldType(mInput).type).toBe('middleName');

      const lInput = document.createElement('input');
      lInput.name = 'thar';
      expect(detectFieldType(lInput).type).toBe('lastName');

      const fullInput = document.createElement('input');
      fullInput.placeholder = 'Pura Naam';
      expect(detectFieldType(fullInput).type).toBe('fullName');
    });

    it('detects address components in Romanized Nepali', () => {
      const prov = document.createElement('input');
      prov.name = 'pradesh';
      expect(detectFieldType(prov).type).toBe('province');

      const dist = document.createElement('input');
      dist.name = 'jilla';
      expect(detectFieldType(dist).type).toBe('district');

      const muni = document.createElement('input');
      muni.placeholder = 'Nagarpalika / Gaupalika';
      expect(detectFieldType(muni).type).toBe('municipality');

      const ward = document.createElement('input');
      ward.name = 'wada_no';
      expect(detectFieldType(ward).type).toBe('ward');

      const addr = document.createElement('input');
      addr.name = 'sthayi_thegana';
      expect(detectFieldType(addr).type).toBe('address');
    });

    it('detects identity & contact fields in Romanized Nepali', () => {
      const pan = document.createElement('input');
      pan.placeholder = 'PAN No / Sthayi Lekha';
      expect(detectFieldType(pan).type).toBe('panNumber');

      const phone = document.createElement('input');
      phone.placeholder = 'Samparka Number (Mobile)';
      expect(detectFieldType(phone).type).toBe('phone');

      const landline = document.createElement('input');
      landline.name = 'durvasa_no';
      expect(detectFieldType(landline).type).toBe('telephone');

      const occ = document.createElement('input');
      occ.name = 'pesha_rojgari';
      expect(detectFieldType(occ).type).toBe('occupation');

      const student = document.createElement('input');
      student.name = 'roll_no';
      expect(detectFieldType(student).type).toBe('studentId');
    });
  });

  describe('Devanagari Script Field Detection', () => {
    it('detects fields with Devanagari labels and placeholders', () => {
      const fInput = document.createElement('input');
      fInput.setAttribute('aria-label', 'पहिलो नाम');
      expect(detectFieldType(fInput).type).toBe('firstName');

      const lInput = document.createElement('input');
      lInput.placeholder = 'थर / उपनाम';
      expect(detectFieldType(lInput).type).toBe('lastName');

      const fullInput = document.createElement('input');
      fullInput.setAttribute('title', 'पूरा नाम');
      expect(detectFieldType(fullInput).type).toBe('fullName');

      const dobInput = document.createElement('input');
      dobInput.placeholder = 'जन्म मिति';
      expect(detectFieldType(dobInput).type).toBe('dateOfBirth');

      const provInput = document.createElement('input');
      provInput.placeholder = 'प्रदेश';
      expect(detectFieldType(provInput).type).toBe('province');

      const distInput = document.createElement('input');
      distInput.placeholder = 'जिल्ला';
      expect(detectFieldType(distInput).type).toBe('district');

      const muniInput = document.createElement('input');
      muniInput.placeholder = 'नगरपालिका / गाउँपालिका';
      expect(detectFieldType(muniInput).type).toBe('municipality');

      const wardInput = document.createElement('input');
      wardInput.placeholder = 'वडा नं';
      expect(detectFieldType(wardInput).type).toBe('ward');

      const addrInput = document.createElement('input');
      addrInput.placeholder = 'स्थायी ठेगाना';
      expect(detectFieldType(addrInput).type).toBe('address');

      const panInput = document.createElement('input');
      panInput.placeholder = 'प्यान नम्बर';
      expect(detectFieldType(panInput).type).toBe('panNumber');
    });
  });

  describe('Complex Modern Form Layouts', () => {
    it('extracts labels from aria-labelledby and aria-describedby', () => {
      document.body.innerHTML = `
        <span id="label-org">Company / Employer</span>
        <span id="desc-org">Registered business name</span>
        <input id="input-org" aria-labelledby="label-org" aria-describedby="desc-org" type="text" />
      `;

      const input = document.getElementById('input-org')!;
      expect(detectFieldType(input).type).toBe('companyName');
    });

    it('detects Material UI and floating label structures', () => {
      document.body.innerHTML = `
        <div class="MuiFormControl-root form-group">
          <label class="MuiFormLabel-root" for="mui-email">Email Address</label>
          <div class="MuiInputBase-root">
            <input id="mui-email" type="text" class="MuiInputBase-input" />
          </div>
        </div>
      `;

      const input = document.getElementById('mui-email')!;
      expect(detectFieldType(input).type).toBe('email');
    });

    it('scans and correctly classifies split address and profile forms', () => {
      document.body.innerHTML = `
        <form id="nepal-gov-form">
          <div class="field"><label>पहिलो नाम</label><input name="fname" type="text" /></div>
          <div class="field"><label>बीचको नाम</label><input name="mname" type="text" /></div>
          <div class="field"><label>थर</label><input name="lname" type="text" /></div>
          <div class="field"><label>प्रदेश</label><select name="province"></select></div>
          <div class="field"><label>जिल्ला</label><select name="district"></select></div>
          <div class="field"><label>नगरपालिका</label><input name="muni" type="text" /></div>
          <div class="field"><label>वडा नं</label><input name="ward" type="number" /></div>
          <div class="field"><label>मोबाइल नम्बर</label><input name="mobile" type="tel" /></div>
          <div class="field"><label>प्यान नम्बर</label><input name="pan" type="text" /></div>
        </form>
      `;

      const detected = scanFormFields();
      expect(detected.length).toBe(9);
      const types = detected.map((d) => d.type);
      expect(types).toEqual([
        'firstName',
        'middleName',
        'lastName',
        'province',
        'district',
        'municipality',
        'ward',
        'phone',
        'panNumber',
      ]);
    });
  });
});
