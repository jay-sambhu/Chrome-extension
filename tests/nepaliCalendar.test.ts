import { describe, it, expect, beforeEach } from 'vitest';
import {
  convertAdToBs,
  splitBsDate,
  detectDateFormat,
  formatBsDate,
  triggerNepaliDatepickerHooks,
  syncCompanionDateInput,
} from '../src/generator/nepaliCalendar';
import { detectFieldType } from '../src/content/detector';
import { fillPage } from '../src/content/filler';
import { generateSyntheticPerson } from '../src/generator/personGenerator';

describe('Phase 1.3: Nepali Calendar (Bikram Sambat) & Datepicker Integration', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('1.3.3 Custom BS Date Formatting & Conversion Helpers', () => {
    it('converts AD date to approximate BS date correctly', () => {
      const bs1 = convertAdToBs('1998-04-28'); // after mid-April -> ~2055-01-28
      expect(bs1).toBe('2055-01-28');

      const bs2 = convertAdToBs('2024-01-15'); // before mid-April -> ~2080-10-15
      expect(bs2).toBe('2080-10-15');
    });

    it('splits BS date into components with month details', () => {
      const split = splitBsDate('2055-01-15');
      expect(split.year).toBe('2055');
      expect(split.month).toBe('01');
      expect(split.day).toBe('15');
      expect(split.monthNum).toBe(1);
      expect(split.monthNameEn).toBe('Baishakh');
      expect(split.monthNameNp).toBe('बैशाख');
    });

    it('detects date format from placeholder or data-format attributes', () => {
      const inputSlash = document.createElement('input');
      inputSlash.placeholder = 'YYYY/MM/DD';
      expect(detectDateFormat(inputSlash)).toBe('YYYY/MM/DD');

      const inputDayFirst = document.createElement('input');
      inputDayFirst.placeholder = 'DD/MM/YYYY';
      expect(detectDateFormat(inputDayFirst)).toBe('DD/MM/YYYY');

      const inputHyphenDayFirst = document.createElement('input');
      inputHyphenDayFirst.setAttribute('data-format', 'DD-MM-YYYY');
      expect(detectDateFormat(inputHyphenDayFirst)).toBe('DD-MM-YYYY');

      const inputDefault = document.createElement('input');
      expect(detectDateFormat(inputDefault)).toBe('YYYY-MM-DD');
    });

    it('formats BS date into custom layout variations and Devanagari numerals', () => {
      const bs = '2055-02-14';

      expect(formatBsDate(bs, { format: 'YYYY-MM-DD', script: 'en' })).toBe('2055-02-14');
      expect(formatBsDate(bs, { format: 'YYYY/MM/DD', script: 'en' })).toBe('2055/02/14');
      expect(formatBsDate(bs, { format: 'DD/MM/YYYY', script: 'en' })).toBe('14/02/2055');
      expect(formatBsDate(bs, { format: 'DD-MM-YYYY', script: 'en' })).toBe('14-02-2055');

      // Devanagari script formatting
      expect(formatBsDate(bs, { format: 'YYYY/MM/DD', script: 'np' })).toBe('२०५५/०२/१४');
      expect(formatBsDate(bs, { format: 'DD-MM-YYYY', script: 'np' })).toBe('१४-०२-२०५५');
    });
  });

  describe('1.3.1 Nepali Datepicker Hooks & Companion Input Synchronization', () => {
    it('detects inputs with popular datepicker classes as dateOfBirthBS or dateBS', () => {
      document.body.innerHTML = `
        <form>
          <input type="text" id="dob1" class="nepali-datepicker" placeholder="Select DOB" />
          <input type="text" id="date1" class="ndp-nepali-datepicker" placeholder="Appointment Date" />
          <input type="text" id="date2" class="hamro-datepicker" placeholder="Event Date" />
          <input type="text" id="date3" class="hasNepaliDatePicker" placeholder="Registration Date" />
        </form>
      `;

      const dob1 = document.getElementById('dob1') as HTMLElement;
      const detectedDob = detectFieldType(dob1);
      expect(detectedDob.type).toBe('dateOfBirthBS');

      const date1 = document.getElementById('date1') as HTMLElement;
      expect(detectFieldType(date1).type).toBe('dateBS');

      const date2 = document.getElementById('date2') as HTMLElement;
      expect(detectFieldType(date2).type).toBe('dateBS');

      const date3 = document.getElementById('date3') as HTMLElement;
      expect(detectFieldType(date3).type).toBe('dateBS');
    });

    it('triggers datepicker custom events and change events when filled', () => {
      const input = document.createElement('input');
      input.id = 'dob_bs';
      input.className = 'nepali-datepicker';
      document.body.appendChild(input);

      let customChangeFired = false;
      let dateSelectFired = false;
      let nativeChangeFired = false;

      input.addEventListener('nepaliDatePicker.change', (e: any) => {
        customChangeFired = true;
        expect(e.detail.date).toBe('2055-01-15');
      });

      input.addEventListener('dateSelect', (e: any) => {
        dateSelectFired = true;
        expect(e.detail.date).toBe('2055-01-15');
      });

      input.addEventListener('change', () => {
        nativeChangeFired = true;
      });

      triggerNepaliDatepickerHooks(input, '2055-01-15', '1998-04-28');

      expect(customChangeFired).toBe(true);
      expect(dateSelectFired).toBe(true);
      expect(nativeChangeFired).toBe(true);
    });

    it('synchronizes companion hidden AD field when filling BS date', () => {
      document.body.innerHTML = `
        <form id="nepali-form">
          <label for="applicant_dob_bs">DOB (BS):</label>
          <input type="text" id="applicant_dob_bs" name="applicant_dob_bs" class="nepali-datepicker" />
          <input type="hidden" id="applicant_dob_ad" name="applicant_dob_ad" value="" />
        </form>
      `;

      const bsInput = document.getElementById('applicant_dob_bs') as HTMLInputElement;
      const adInput = document.getElementById('applicant_dob_ad') as HTMLInputElement;

      syncCompanionDateInput(bsInput, '1998-04-28', 'ad');
      expect(adInput.value).toBe('1998-04-28');
    });

    it('synchronizes companion hidden BS field when filling AD date', () => {
      document.body.innerHTML = `
        <form id="reg-form">
          <label for="birth_date_ad">Date of Birth (AD):</label>
          <input type="date" id="birth_date_ad" name="birth_date_ad" />
          <input type="hidden" id="birth_date_bs" name="birth_date_bs" value="" />
        </form>
      `;

      const adInput = document.getElementById('birth_date_ad') as HTMLInputElement;
      const bsInput = document.getElementById('birth_date_bs') as HTMLInputElement;

      syncCompanionDateInput(adInput, '2055-01-15', 'bs');
      expect(bsInput.value).toBe('2055-01-15');
    });
  });

  describe('1.3.2 Split BS Date Dropdowns', () => {
    it('detects split dropdown fields for BS Year, BS Month, and BS Day', () => {
      document.body.innerHTML = `
        <form>
          <fieldset>
            <legend>जन्म मिति (वि.सं.)</legend>
            <select id="bs_year" name="bs_year">
              <option value="">Year</option>
              <option value="2078">2078</option>
              <option value="2079">2079</option>
              <option value="2080">2080</option>
            </select>

            <select id="bs_month" name="bs_month">
              <option value="">Month</option>
              <option value="1">Baishakh</option>
              <option value="2">Jestha</option>
            </select>

            <select id="bs_day" name="bs_day">
              <option value="">Day</option>
              <option value="1">1 गते</option>
              <option value="2">2 गते</option>
            </select>
          </fieldset>
        </form>
      `;

      const yearSelect = document.getElementById('bs_year') as HTMLElement;
      const monthSelect = document.getElementById('bs_month') as HTMLElement;
      const daySelect = document.getElementById('bs_day') as HTMLElement;

      expect(detectFieldType(yearSelect).type).toBe('bsYear');
      expect(detectFieldType(monthSelect).type).toBe('bsMonth');
      expect(detectFieldType(daySelect).type).toBe('bsDay');
    });

    it('accurately fills split BS dropdowns with English values', () => {
      document.body.innerHTML = `
        <form id="split-form">
          <label for="year">Year (BS)</label>
          <select id="year" name="year_bs">
            <option value="">Select Year</option>
            <option value="2054">2054</option>
            <option value="2055">2055</option>
            <option value="2056">2056</option>
          </select>

          <label for="month">Month (BS)</label>
          <select id="month" name="month_bs">
            <option value="">Select Month</option>
            <option value="Baishakh">Baishakh</option>
            <option value="Jestha">Jestha</option>
            <option value="Ashadh">Ashadh</option>
          </select>

          <label for="day">Day (BS)</label>
          <select id="day" name="day_bs">
            <option value="">Select Day</option>
            <option value="14">14</option>
            <option value="15">15</option>
            <option value="16">16</option>
          </select>
        </form>
      `;

      const person = generateSyntheticPerson('general');
      person.dateOfBirthBS = '2055-01-15';

      const result = fillPage(
        person,
        {
          profile: 'general',
          script: 'en',
          fillCategories: { personal: true, contact: true, address: true, professional: true },
        },
        document.getElementById('split-form')!
      );

      expect(result.fieldsFilledCount).toBe(3);

      const yearSelect = document.getElementById('year') as HTMLSelectElement;
      const monthSelect = document.getElementById('month') as HTMLSelectElement;
      const daySelect = document.getElementById('day') as HTMLSelectElement;

      expect(yearSelect.value).toBe('2055');
      expect(monthSelect.value).toBe('Baishakh');
      expect(daySelect.value).toBe('15');
    });

    it('accurately fills split BS dropdowns with Devanagari and numeric month variations', () => {
      document.body.innerHTML = `
        <form id="np-split-form">
          <fieldset>
            <legend>वि.सं. जन्ममिति</legend>
            <select id="yr" name="yr">
              <option value="">साल छान्नुहोस्</option>
              <option value="२०५४">२०५४</option>
              <option value="२०५५">२०५५</option>
            </select>

            <select id="mo" name="mo">
              <option value="">महिना</option>
              <option value="बैशाख">बैशाख</option>
              <option value="जेठ">जेठ</option>
            </select>

            <select id="gatey" name="gatey">
              <option value="">गते</option>
              <option value="१४">१४ गते</option>
              <option value="१५">१५ गते</option>
            </select>
          </fieldset>
        </form>
      `;

      const person = generateSyntheticPerson('general');
      person.dateOfBirthBS = '2055-01-15';

      const result = fillPage(
        person,
        {
          profile: 'general',
          script: 'np',
          fillCategories: { personal: true, contact: true, address: true, professional: true },
        },
        document.getElementById('np-split-form')!
      );

      expect(result.fieldsFilledCount).toBe(3);

      const yr = document.getElementById('yr') as HTMLSelectElement;
      const mo = document.getElementById('mo') as HTMLSelectElement;
      const gatey = document.getElementById('gatey') as HTMLSelectElement;

      expect(yr.value).toBe('२०५५');
      expect(mo.value).toBe('बैशाख');
      expect(gatey.value).toBe('१५');
    });

    it('matches BS months by numeric value (1-12) even when target is string name', () => {
      document.body.innerHTML = `
        <form id="numeric-month-form">
          <label for="bs_month">महिना (वि.सं.)</label>
          <select id="bs_month" name="bs_month">
            <option value="">Select Month</option>
            <option value="1">वैशाख (01)</option>
            <option value="2">ज्येष्ठ (02)</option>
          </select>
        </form>
      `;

      const person = generateSyntheticPerson('general');
      person.dateOfBirthBS = '2055-01-15';

      fillPage(
        person,
        {
          profile: 'general',
          script: 'en',
          fillCategories: { personal: true, contact: true, address: true, professional: true },
        },
        document.getElementById('numeric-month-form')!
      );

      const monthSelect = document.getElementById('bs_month') as HTMLSelectElement;
      expect(monthSelect.value).toBe('1');
    });
  });

  describe('Integrated Form Filling with Custom BS Date Formats & Datepickers', () => {
    it('formats BS date input matching slash pattern YYYY/MM/DD and auto-syncs hidden companion AD field', () => {
      document.body.innerHTML = `
        <form id="portal-form">
          <label for="dob_bs">DOB in Bikram Sambat (YYYY/MM/DD):</label>
          <input type="text" id="dob_bs" name="dob_bs" class="nepali-datepicker" placeholder="YYYY/MM/DD" />
          <input type="hidden" id="dob_ad" name="dob_ad" value="" />
        </form>
      `;

      const person = generateSyntheticPerson('general');
      person.dateOfBirth = '1998-04-28';
      person.dateOfBirthBS = '2055-01-15';

      const result = fillPage(
        person,
        {
          profile: 'general',
          script: 'en',
          fillCategories: { personal: true, contact: true, address: true, professional: true },
        },
        document.getElementById('portal-form')!
      );

      expect(result.fieldsFilledCount).toBe(1);

      const bsInput = document.getElementById('dob_bs') as HTMLInputElement;
      const adInput = document.getElementById('dob_ad') as HTMLInputElement;

      // Custom slash format verified
      expect(bsInput.value).toBe('2055/01/15');
      // Companion AD synchronization verified
      expect(adInput.value).toBe('1998-04-28');
    });

    it('formats BS date in Devanagari numerals when script is np', () => {
      document.body.innerHTML = `
        <form id="np-form">
          <label for="nepali_dob">जन्म मिति (वि.सं.)</label>
          <input type="text" id="nepali_dob" name="nepali_dob_bs" placeholder="YYYY/MM/DD" class="nepali-datepicker" />
        </form>
      `;

      const person = generateSyntheticPerson('general');
      person.dateOfBirthBS = '2055-01-15';

      fillPage(
        person,
        {
          profile: 'general',
          script: 'np',
          fillCategories: { personal: true, contact: true, address: true, professional: true },
        },
        document.getElementById('np-form')!
      );

      const input = document.getElementById('nepali_dob') as HTMLInputElement;
      expect(input.value).toBe('२०५५/०१/१५');
    });
  });
});
