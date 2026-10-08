import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateSyntheticPerson,
  generateDualNepalAddresses,
} from '../src/generator/personGenerator';
import {
  detectFieldType,
  scanFormFields,
} from '../src/content/detector';
import { fillPage } from '../src/content/filler';
import { FillOptions } from '../src/types';
import { NepalDataEngine } from '../src/generator/nepalDataEngine';

describe('Phase 1.2 — Permanent vs. Temporary / Current Address Distinction', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('1. Distinct Dual Address Generation', () => {
    it('generates distinct permanent and temporary addresses for every synthetic person', () => {
      const person = generateSyntheticPerson('general');

      expect(person.address).toBeDefined();
      expect(person.permanentAddress).toBeDefined();
      expect(person.temporaryAddress).toBeDefined();
      expect(person.currentAddress).toBeDefined();

      // Permanent address aliases match
      expect(person.permanentAddress?.district).toBe(person.address.district);
      expect(person.permanentAddress?.province).toBe(person.address.province);

      // Current address alias matches temporary address
      expect(person.currentAddress?.district).toBe(person.temporaryAddress?.district);
      expect(person.currentAddress?.province).toBe(person.temporaryAddress?.province);

      // Temporary address is distinct from permanent address
      expect(person.temporaryAddress?.district).not.toBe(person.permanentAddress?.district);
    });

    it('strictly preserves geographic hierarchy in generated temporary address', () => {
      for (let i = 0; i < 50; i++) {
        const { permanentAddress, temporaryAddress } = generateDualNepalAddresses();

        expect(temporaryAddress.district).not.toBe(permanentAddress.district);

        // Verify district exists in declared province
        const validDistricts = NepalDataEngine.getDistrictsByProvince(temporaryAddress.province);
        expect(validDistricts.some((d) => d.name === temporaryAddress.district)).toBe(true);

        // Verify municipality exists in declared district
        const validMunis = NepalDataEngine.getMunicipalitiesByDistrict(temporaryAddress.district);
        expect(validMunis.some((m) => m.name === temporaryAddress.municipality)).toBe(true);

        // Ward number within valid bounds
        expect(temporaryAddress.ward).toBeGreaterThanOrEqual(1);
        expect(temporaryAddress.ward).toBeLessThanOrEqual(35);
      }
    });

    it('generates coherent Devanagari details for both permanent and temporary addresses', () => {
      const person = generateSyntheticPerson('employee');
      const dev = person.devanagari;

      expect(dev).toBeDefined();
      expect(dev?.permanentProvince).toBeDefined();
      expect(dev?.permanentDistrict).toBeDefined();
      expect(dev?.permanentMunicipality).toBeDefined();
      expect(dev?.permanentWard).toContain('वडा नं.');
      expect(dev?.permanentFullAddress).toBeDefined();

      expect(dev?.tempProvince).toBeDefined();
      expect(dev?.tempDistrict).toBeDefined();
      expect(dev?.tempMunicipality).toBeDefined();
      expect(dev?.tempWard).toContain('वडा नं.');
      expect(dev?.tempFullAddress).toBeDefined();

      // Devanagari addresses reflect different locations
      expect(dev?.tempDistrict).not.toBe(dev?.permanentDistrict);
    });
  });

  describe('2. Prefix & Context Detection Engine', () => {
    it('detects permanent address fields with explicit prefixes in name or id', () => {
      const div = document.createElement('div');
      div.innerHTML = `
        <input name="permanent_province" id="p_prov" />
        <input name="perm_district" id="p_dist" />
        <input name="sthayee_municipality" id="p_muni" />
        <input name="sthayi_ward" id="p_ward" />
        <input name="permanent_tole" id="p_tole" />
        <input name="permanent_address" id="p_addr" />
      `;
      document.body.appendChild(div);

      const fields = scanFormFields(div);

      expect(fields.find((f) => f.name === 'permanent_province')?.type).toBe('permanentProvince');
      expect(fields.find((f) => f.name === 'permanent_province')?.addressScope).toBe('permanent');

      expect(fields.find((f) => f.name === 'perm_district')?.type).toBe('permanentDistrict');
      expect(fields.find((f) => f.name === 'perm_district')?.addressScope).toBe('permanent');

      expect(fields.find((f) => f.name === 'sthayee_municipality')?.type).toBe('permanentMunicipality');
      expect(fields.find((f) => f.name === 'sthayee_municipality')?.addressScope).toBe('permanent');

      expect(fields.find((f) => f.name === 'sthayi_ward')?.type).toBe('permanentWard');
      expect(fields.find((f) => f.name === 'sthayi_ward')?.addressScope).toBe('permanent');

      expect(fields.find((f) => f.name === 'permanent_tole')?.type).toBe('permanentTole');
      expect(fields.find((f) => f.name === 'permanent_tole')?.addressScope).toBe('permanent');

      expect(fields.find((f) => f.name === 'permanent_address')?.type).toBe('permanentAddress');
      expect(fields.find((f) => f.name === 'permanent_address')?.addressScope).toBe('permanent');
    });

    it('detects temporary and current address fields with explicit prefixes in name or id', () => {
      const div = document.createElement('div');
      div.innerHTML = `
        <input name="temp_province" id="t_prov" />
        <input name="current_district" id="c_dist" />
        <input name="asthyee_municipality" id="t_muni" />
        <input name="asthayi_ward" id="t_ward" />
        <input name="halko_tole" id="t_tole" />
        <input name="temporary_address" id="t_addr" />
      `;
      document.body.appendChild(div);

      const fields = scanFormFields(div);

      expect(fields.find((f) => f.name === 'temp_province')?.type).toBe('temporaryProvince');
      expect(fields.find((f) => f.name === 'temp_province')?.addressScope).toBe('temporary');

      expect(fields.find((f) => f.name === 'current_district')?.type).toBe('temporaryDistrict');
      expect(fields.find((f) => f.name === 'current_district')?.addressScope).toBe('temporary');

      expect(fields.find((f) => f.name === 'asthyee_municipality')?.type).toBe('temporaryMunicipality');
      expect(fields.find((f) => f.name === 'asthyee_municipality')?.addressScope).toBe('temporary');

      expect(fields.find((f) => f.name === 'asthayi_ward')?.type).toBe('temporaryWard');
      expect(fields.find((f) => f.name === 'asthayi_ward')?.addressScope).toBe('temporary');

      expect(fields.find((f) => f.name === 'halko_tole')?.type).toBe('temporaryTole');
      expect(fields.find((f) => f.name === 'halko_tole')?.addressScope).toBe('temporary');

      expect(fields.find((f) => f.name === 'temporary_address')?.type).toBe('temporaryAddress');
      expect(fields.find((f) => f.name === 'temporary_address')?.addressScope).toBe('temporary');
    });

    it('detects Devanagari labels distinguishing permanent vs temporary address', () => {
      const div = document.createElement('div');
      div.innerHTML = `
        <div>
          <label for="d1">स्थायी ठेगाना - जिल्ला</label>
          <input id="d1" />
        </div>
        <div>
          <label for="d2">हालको ठेगाना - जिल्ला</label>
          <input id="d2" />
        </div>
        <div>
          <label for="a1">स्थायी ठेगाना</label>
          <input id="a1" />
        </div>
        <div>
          <label for="a2">अस्थायी ठेगाना</label>
          <input id="a2" />
        </div>
      `;
      document.body.appendChild(div);

      const fD1 = detectFieldType(document.getElementById('d1')!);
      expect(fD1.type).toBe('permanentDistrict');
      expect(fD1.addressScope).toBe('permanent');

      const fD2 = detectFieldType(document.getElementById('d2')!);
      expect(fD2.type).toBe('temporaryDistrict');
      expect(fD2.addressScope).toBe('temporary');

      const fA1 = detectFieldType(document.getElementById('a1')!);
      expect(fA1.addressScope).toBe('permanent');

      const fA2 = detectFieldType(document.getElementById('a2')!);
      expect(fA2.addressScope).toBe('temporary');
    });

    it('infers address scope from enclosing <fieldset> and <legend>', () => {
      const form = document.createElement('form');
      form.innerHTML = `
        <fieldset>
          <legend>Permanent Address (स्थायी ठेगाना)</legend>
          <input name="district" id="perm_dist_input" />
          <input name="municipality" id="perm_muni_input" />
        </fieldset>
        <fieldset>
          <legend>Temporary Address (अस्थायी ठेगाना)</legend>
          <input name="district" id="temp_dist_input" />
          <input name="municipality" id="temp_muni_input" />
        </fieldset>
      `;
      document.body.appendChild(form);

      const pDist = detectFieldType(document.getElementById('perm_dist_input')!);
      expect(pDist.type).toBe('permanentDistrict');
      expect(pDist.addressScope).toBe('permanent');

      const tDist = detectFieldType(document.getElementById('temp_dist_input')!);
      expect(tDist.type).toBe('temporaryDistrict');
      expect(tDist.addressScope).toBe('temporary');

      const tMuni = detectFieldType(document.getElementById('temp_muni_input')!);
      expect(tMuni.type).toBe('temporaryMunicipality');
      expect(tMuni.addressScope).toBe('temporary');
    });

    it('infers address scope from container class and headings', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <div class="current-address-card">
          <h3>Current Residential Location (हालको बसोबास)</h3>
          <input name="province" id="curr_prov_input" />
          <input name="tole" id="curr_tole_input" />
        </div>
      `;
      document.body.appendChild(container);

      const prov = detectFieldType(document.getElementById('curr_prov_input')!);
      expect(prov.type).toBe('temporaryProvince');
      expect(prov.addressScope).toBe('temporary');

      const tole = detectFieldType(document.getElementById('curr_tole_input')!);
      expect(tole.type).toBe('temporaryTole');
      expect(tole.addressScope).toBe('temporary');
    });
  });

  describe('3. Same-as-Permanent Checkbox Auto-Sync', () => {
    it('detects same-as-permanent checkbox by standard ID or name patterns', () => {
      const div = document.createElement('div');
      div.innerHTML = `
        <input type="checkbox" id="same_as_permanent" />
        <input type="checkbox" name="sameAsPermanent" id="same_p2" />
        <input type="checkbox" id="chk_same_address" />
        <label for="chk_same_address">Same as Permanent Address</label>
      `;
      document.body.appendChild(div);

      const f1 = detectFieldType(document.getElementById('same_as_permanent')!);
      expect(f1.type).toBe('sameAsPermanent');
      expect(f1.confidence).toBeGreaterThanOrEqual(0.95);

      const f2 = detectFieldType(document.getElementById('same_p2')!);
      expect(f2.type).toBe('sameAsPermanent');

      const f3 = detectFieldType(document.getElementById('chk_same_address')!);
      expect(f3.type).toBe('sameAsPermanent');
    });

    it('detects Devanagari labels for same-as-permanent checkbox', () => {
      const div = document.createElement('div');
      div.innerHTML = `
        <label>
          <input type="checkbox" id="chk_nep_same" />
          स्थायी ठेगाना अनुसार (Same as Permanent)
        </label>
      `;
      document.body.appendChild(div);

      const f = detectFieldType(document.getElementById('chk_nep_same')!);
      expect(f.type).toBe('sameAsPermanent');
    });
  });

  describe('4. Form Filling & Dual Address Populating', () => {
    const defaultOptions: FillOptions = {
      profile: 'general',
      fillScript: 'en',
      fillCategories: {
        personal: true,
        contact: true,
        address: true,
        professional: true,
      },
    };

    it('fills both permanent and temporary address fields with distinct realistic data', () => {
      const form = document.createElement('form');
      form.innerHTML = `
        <fieldset>
          <legend>Permanent Address</legend>
          <input name="permanent_district" id="perm_d" />
          <input name="permanent_municipality" id="perm_m" />
        </fieldset>
        <fieldset>
          <legend>Current Address</legend>
          <input name="current_district" id="curr_d" />
          <input name="current_municipality" id="curr_m" />
        </fieldset>
      `;
      document.body.appendChild(form);

      const person = generateSyntheticPerson('general');
      const result = fillPage(person, defaultOptions, form);

      expect(result.success).toBe(true);
      expect(result.fieldsFilledCount).toBe(4);

      const permDVal = (document.getElementById('perm_d') as HTMLInputElement).value;
      const currDVal = (document.getElementById('curr_d') as HTMLInputElement).value;

      expect(permDVal).toBe(person.permanentAddress?.district);
      expect(currDVal).toBe(person.temporaryAddress?.district);
      expect(permDVal).not.toBe(currDVal);
    });

    it('fills dual addresses in Devanagari when requested', () => {
      const form = document.createElement('form');
      form.innerHTML = `
        <input name="permanent_district" id="np_perm_d" />
        <input name="temporary_district" id="np_temp_d" />
      `;
      document.body.appendChild(form);

      const person = generateSyntheticPerson('general');
      const result = fillPage(person, { ...defaultOptions, fillScript: 'np' }, form);

      expect(result.success).toBe(true);
      const permVal = (document.getElementById('np_perm_d') as HTMLInputElement).value;
      const tempVal = (document.getElementById('np_temp_d') as HTMLInputElement).value;

      expect(permVal).toBe(person.devanagari?.permanentDistrict);
      expect(tempVal).toBe(person.devanagari?.tempDistrict);
      expect(permVal).not.toBe(tempVal);
    });

    it('automatically checks the "Same as Permanent Address" checkbox during fill', () => {
      const form = document.createElement('form');
      form.innerHTML = `
        <input name="permanent_district" id="p_dist" />
        <input type="checkbox" id="same_as_permanent" name="sameAsPermanent" />
      `;
      document.body.appendChild(form);

      const sameCheckbox = document.getElementById('same_as_permanent') as HTMLInputElement;
      expect(sameCheckbox.checked).toBe(false);

      let clickFired = false;
      let changeFired = false;
      sameCheckbox.addEventListener('click', () => {
        clickFired = true;
      });
      sameCheckbox.addEventListener('change', () => {
        changeFired = true;
      });

      const person = generateSyntheticPerson('general');
      const result = fillPage(person, defaultOptions, form);

      expect(result.success).toBe(true);
      expect(sameCheckbox.checked).toBe(true);
      expect(clickFired).toBe(true);
      expect(changeFired).toBe(true);
    });
  });
});
