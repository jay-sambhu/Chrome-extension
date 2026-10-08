import { describe, it, expect, beforeEach } from 'vitest';
import {
  COMMERCIAL_BANKS,
  generateBankBranch,
  generateBankAccountNumber,
  generateBankingDetails,
} from '../src/generator/bankingDetails';
import { generateSyntheticPerson } from '../src/generator/personGenerator';
import { detectFieldType } from '../src/content/detector';
import { fillPage } from '../src/content/filler';
import { toEnglishNumerals } from '../src/generator/devanagariEngine';

describe('Phase 1.5 — FinTech, Banking & Digital Wallet Test Data', () => {
  describe('Commercial Banks Engine', () => {
    it('contains all 20 NRB Class A Commercial Banks with full metadata', () => {
      expect(COMMERCIAL_BANKS.length).toBe(20);

      for (const bank of COMMERCIAL_BANKS) {
        expect(bank.nameEn).toBeTruthy();
        expect(bank.nameNp).toBeTruthy();
        expect(bank.shortName).toBeTruthy();
        expect(bank.swiftCode).toMatch(/^[A-Z]{8}$/);
        expect(bank.accountLength).toBeGreaterThanOrEqual(14);
        expect(bank.accountLength).toBeLessThanOrEqual(16);
      }
    });

    it('includes flagship banks: Nabil, NIC Asia, Global IME, RBB', () => {
      const names = COMMERCIAL_BANKS.map((b) => b.shortName);
      expect(names).toContain('Nabil Bank');
      expect(names).toContain('NIC Asia Bank');
      expect(names).toContain('Global IME Bank');
      expect(names).toContain('Rastriya Banijya Bank');
      expect(names).toContain('Sanima Bank');
      expect(names).toContain('Standard Chartered Bank');
    });
  });

  describe('Branch & Account Number Generation', () => {
    it('generates Kathmandu Valley branches for Valley districts', () => {
      const branchKtm = generateBankBranch('Kathmandu');
      expect(branchKtm.en).toContain('Branch');
      expect(branchKtm.np).toContain('शाखा');

      const branchLalitpur = generateBankBranch('Lalitpur');
      expect(branchLalitpur.en).toContain('Branch');
    });

    it('generates district-coupled branches for prominent districts', () => {
      const branchKaski = generateBankBranch('Kaski');
      expect(branchKaski.en).toContain('Pokhara');
      expect(branchKaski.np).toContain('पोखरा');

      const branchMorang = generateBankBranch('Morang');
      expect(branchMorang.en).toContain('Biratnagar');
      expect(branchMorang.np).toContain('विराटनगर');

      const branchChitwan = generateBankBranch('Chitwan');
      expect(branchChitwan.en).toContain('Chitwan');
      expect(branchChitwan.np).toContain('चितवन');
    });

    it('generates 14 to 16 digit synthetic bank account numbers', () => {
      for (let i = 0; i < 50; i++) {
        const acc14 = generateBankAccountNumber(14);
        expect(acc14).toMatch(/^\d{14}$/);

        const acc16 = generateBankAccountNumber(16);
        expect(acc16).toMatch(/^\d{16}$/);
      }
    });
  });

  describe('Digital Wallets Engine (eSewa & Khalti)', () => {
    it('couples eSewa ID and Khalti ID directly with the Nepali mobile phone number', () => {
      const phone = '9841234567';
      const banking = generateBankingDetails('Ram Sharma', 'राम शर्मा', 'Kathmandu', phone);

      expect(banking.esewaId).toBe(phone);
      expect(banking.khaltiId).toBe(phone);
      expect(banking.bankAccountName).toBe('Ram Sharma');
      expect(banking.bankAccountNumber.length).toBeGreaterThanOrEqual(14);
      expect(banking.bankAccountNumber.length).toBeLessThanOrEqual(16);
    });
  });

  describe('Synthetic Person Integration', () => {
    it('enriches synthetic personas with consistent banking and wallet details', () => {
      const person = generateSyntheticPerson('employee');

      expect(person.bankName).toBeTruthy();
      expect(COMMERCIAL_BANKS.some((b) => b.nameEn === person.bankName)).toBe(true);

      expect(person.bankBranch).toBeTruthy();
      expect(person.bankAccountNumber).toMatch(/^\d{14,16}$/);
      expect(person.bankAccountName).toBe(person.fullName);

      expect(person.esewaId).toBe(person.phone);
      expect(person.khaltiId).toBe(person.phone);

      // Devanagari details
      expect(person.devanagari).toBeDefined();
      expect(person.devanagari?.bankName).toBeTruthy();
      expect(person.devanagari?.bankBranch).toContain('शाखा');
      expect(person.devanagari?.bankAccountName).toBe(person.devanagari?.fullName);
      expect(toEnglishNumerals(person.devanagari!.bankAccountNumber!)).toBe(person.bankAccountNumber);
      expect(toEnglishNumerals(person.devanagari!.esewaId!)).toBe(person.phone);
    });
  });

  describe('Form Field Detection for FinTech & Banking', () => {
    it('detects bank name, branch, account number, and account holder name', () => {
      const inputBank = document.createElement('input');
      inputBank.setAttribute('name', 'bank_name');
      expect(detectFieldType(inputBank).type).toBe('bankName');

      const inputBranch = document.createElement('input');
      inputBranch.setAttribute('name', 'bank_branch');
      expect(detectFieldType(inputBranch).type).toBe('bankBranch');

      const inputAccNo = document.createElement('input');
      inputAccNo.setAttribute('name', 'account_number');
      expect(detectFieldType(inputAccNo).type).toBe('bankAccountNumber');

      const inputAccHolder = document.createElement('input');
      inputAccHolder.setAttribute('name', 'account_holder_name');
      expect(detectFieldType(inputAccHolder).type).toBe('bankAccountName');
    });

    it('detects eSewa ID and Khalti ID', () => {
      const inputEsewa = document.createElement('input');
      inputEsewa.setAttribute('name', 'esewa_id');
      expect(detectFieldType(inputEsewa).type).toBe('esewaId');

      const inputKhalti = document.createElement('input');
      inputKhalti.setAttribute('placeholder', 'Khalti ID / Number');
      expect(detectFieldType(inputKhalti).type).toBe('khaltiId');
    });

    it('detects Devanagari banking and digital wallet fields', () => {
      const inputAccNp = document.createElement('input');
      inputAccNp.setAttribute('placeholder', 'बैंक खाता नम्बर');
      expect(detectFieldType(inputAccNp).type).toBe('bankAccountNumber');

      const inputHolderNp = document.createElement('input');
      inputHolderNp.setAttribute('name', 'खातावालाको नाम');
      expect(detectFieldType(inputHolderNp).type).toBe('bankAccountName');

      const inputBankNp = document.createElement('input');
      inputBankNp.setAttribute('placeholder', 'बैंकको नाम');
      expect(detectFieldType(inputBankNp).type).toBe('bankName');

      const inputBranchNp = document.createElement('input');
      inputBranchNp.setAttribute('name', 'बैंक शाखा');
      expect(detectFieldType(inputBranchNp).type).toBe('bankBranch');

      const inputEsewaNp = document.createElement('input');
      inputEsewaNp.setAttribute('placeholder', 'ईसेवा आइडी');
      expect(detectFieldType(inputEsewaNp).type).toBe('esewaId');

      const inputKhaltiNp = document.createElement('input');
      inputKhaltiNp.setAttribute('name', 'खल्ती आइडी');
      expect(detectFieldType(inputKhaltiNp).type).toBe('khaltiId');
    });
  });

  describe('Form Filling and Bank Dropdown Selection', () => {
    let form: HTMLFormElement;

    beforeEach(() => {
      document.body.innerHTML = '';
      form = document.createElement('form');
      document.body.appendChild(form);
    });

    it('fills banking and digital wallet fields accurately in English', () => {
      form.innerHTML = `
        <input name="bank_name" type="text" />
        <input name="bank_branch" type="text" />
        <input name="account_number" type="text" />
        <input name="account_holder_name" type="text" />
        <input name="esewa_id" type="text" />
        <input name="khalti_id" type="text" />
      `;

      const person = generateSyntheticPerson('employee');
      const result = fillPage(person, {
        profile: 'employee',
        script: 'en',
        fillCategories: { personal: true, contact: true, address: true, professional: true },
      });

      expect(result.success).toBe(true);
      expect(result.fieldsFilledCount).toBe(6);

      const bankName = (form.querySelector('input[name="bank_name"]') as HTMLInputElement).value;
      const bankBranch = (form.querySelector('input[name="bank_branch"]') as HTMLInputElement).value;
      const accNo = (form.querySelector('input[name="account_number"]') as HTMLInputElement).value;
      const accName = (form.querySelector('input[name="account_holder_name"]') as HTMLInputElement).value;
      const esewa = (form.querySelector('input[name="esewa_id"]') as HTMLInputElement).value;
      const khalti = (form.querySelector('input[name="khalti_id"]') as HTMLInputElement).value;

      expect(bankName).toBe(person.bankName);
      expect(bankBranch).toBe(person.bankBranch);
      expect(accNo).toBe(person.bankAccountNumber);
      expect(accName).toBe(person.bankAccountName);
      expect(esewa).toBe(person.esewaId);
      expect(khalti).toBe(person.khaltiId);
    });

    it('matches and selects commercial bank in select dropdowns', () => {
      form.innerHTML = `
        <select name="bank_name">
          <option value="">Select Bank</option>
          <option value="Nabil Bank">Nabil Bank Limited</option>
          <option value="NIC Asia">NIC Asia Bank</option>
          <option value="Global IME">Global IME Bank</option>
        </select>
      `;

      const person = generateSyntheticPerson('employee');
      person.bankName = 'NIC Asia Bank Limited';

      fillPage(person, {
        profile: 'employee',
        script: 'en',
        fillCategories: { personal: true, contact: true, address: true, professional: true },
      });

      const select = form.querySelector('select[name="bank_name"]') as HTMLSelectElement;
      expect(select.value).toBe('NIC Asia');
    });

    it('fills banking details in Devanagari script', () => {
      form.innerHTML = `
        <input name="bank_name" type="text" />
        <input name="bank_branch" type="text" />
        <input name="account_holder_name" type="text" />
        <input name="esewa_id" type="text" />
      `;

      const person = generateSyntheticPerson('employee');
      fillPage(person, {
        profile: 'employee',
        script: 'np',
        fillCategories: { personal: true, contact: true, address: true, professional: true },
      });

      const bankName = (form.querySelector('input[name="bank_name"]') as HTMLInputElement).value;
      const bankBranch = (form.querySelector('input[name="bank_branch"]') as HTMLInputElement).value;
      const accName = (form.querySelector('input[name="account_holder_name"]') as HTMLInputElement).value;
      const esewa = (form.querySelector('input[name="esewa_id"]') as HTMLInputElement).value;

      expect(bankName).toBe(person.devanagari?.bankName);
      expect(bankBranch).toContain('शाखा');
      expect(accName).toBe(person.devanagari?.bankAccountName);
      expect(esewa).toBe(person.devanagari?.esewaId);
    });
  });
});
