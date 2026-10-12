import { describe, it, expect } from 'vitest';
import { generateSyntheticPerson, generateNepalAddress } from '../src/generator/personGenerator';
import { generatePersonFromPreset, BUILTIN_PERSONA_PRESETS } from '../src/services/personaPresets';
import { NepalDataEngine } from '../src/generator/nepalDataEngine';
import { getDistrictCode } from '../src/generator/governmentDocuments';
import { convertAdToBs, convertBsToAd } from '../src/generator/nepaliCalendar';
import {
  DISTRICTS_DEVANAGARI,
  FIRST_NAMES_DEVANAGARI,
  SURNAMES_DEVANAGARI,
  TOLES_DEVANAGARI,
  generateDevanagariDetails,
  transliterateLatin,
  transliterateText,
  transliterateMunicipality,
} from '../src/generator/devanagariEngine';
import { COMMERCIAL_BANKS, findCommercialBank } from '../src/generator/bankingDetails';
import { PersonaPreset, ProfileType, SyntheticPerson } from '../src/types';

const PROFILES: ProfileType[] = ['general', 'student', 'employee', 'business', 'teacher', 'farmer'];
const AGE_RANGES: Record<ProfileType, [number, number]> = {
  general: [22, 55],
  student: [16, 24],
  employee: [23, 58],
  business: [28, 65],
  teacher: [25, 62],
  farmer: [28, 68],
};
const NOW = new Date(2026, 9, 12); // 2026-10-12 AD = 2083-06-26 BS
const TODAY_AD = '2026-10-12';
const TODAY_BS = '2083-06-26';

const LATIN = /[A-Za-z]/;

function completedYearsAt(dob: string, today: string): number {
  const [by, bm, bd] = dob.split('-').map(Number);
  const [ty, tm, td] = today.split('-').map(Number);
  return ty - by - (tm < bm || (tm === bm && td < bd) ? 1 : 0);
}

function isReservedEmailDomain(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase() || '';
  return (
    ['example.com', 'example.org', 'example.net'].includes(domain) ||
    /(^|\.)example\.(com|org|net)$/.test(domain) ||
    /\.(test|example)$/.test(domain) ||
    domain === 'test' ||
    domain === 'example'
  );
}

describe('Generator consistency (dates, documents, emails, presets, Devanagari)', () => {
  describe('Age / DOB / document dates over 2,000 persons per profile', () => {
    for (const profile of PROFILES) {
      it(`keeps age, DOB and document dates consistent for ${profile}`, () => {
        const [minAge, maxAge] = AGE_RANGES[profile];
        const failures: string[] = [];

        for (let i = 0; i < 2000; i++) {
          const p = generateSyntheticPerson(profile, undefined, { now: NOW });
          const exactAge = completedYearsAt(p.dateOfBirth, TODAY_AD);
          const problems: string[] = [];

          if (p.age !== exactAge) problems.push(`age ${p.age} != ${exactAge}`);
          if (p.age < minAge || p.age > maxAge) problems.push(`age ${p.age} outside ${minAge}-${maxAge}`);
          if (p.dateOfBirthBS !== convertAdToBs(p.dateOfBirth)) problems.push('dobBS mismatch');
          if (convertBsToAd(p.dateOfBirthBS!) !== p.dateOfBirth) problems.push('dobBS round trip');

          // Citizenship: issued on/after 16th BS birthday, never in the future
          const [byBs, bmBs, bdBs] = p.dateOfBirthBS!.split('-');
          const sixteenthBs = `${Number(byBs) + 16}-${bmBs}-${bdBs}`;
          if (!p.citizenshipIssueDateBS || convertBsToAd(p.citizenshipIssueDateBS) === '') problems.push('invalid citizenship date');
          else if (p.citizenshipIssueDateBS < sixteenthBs.slice(0, 7) || p.citizenshipIssueDateBS > TODAY_BS) problems.push(`citizenship ${p.citizenshipIssueDateBS}`);

          // Passport: issued at >= 16, not in the future, valid 10 years
          if (p.passportIssueDate) {
            if (completedYearsAt(p.dateOfBirth, p.passportIssueDate) < 16) problems.push('passport under 16');
            if (p.passportIssueDate >= TODAY_AD) problems.push('passport future');
            if (p.passportExpiryDate! <= p.passportIssueDate) problems.push('passport expiry');
          } else if (p.age >= 17) {
            problems.push('adult without passport');
          }

          // Driving licence: A/K >= 16, B >= 18
          if (p.drivingLicenseIssueDate) {
            const ageAtIssue = completedYearsAt(p.dateOfBirth, p.drivingLicenseIssueDate);
            const needs = /\bB\b/.test(p.drivingLicenseCategory!.replace('Category ', '')) ? 18 : 16;
            if (ageAtIssue < needs) problems.push(`licence ${p.drivingLicenseCategory} at ${ageAtIssue}`);
            if (p.drivingLicenseIssueDate >= TODAY_AD) problems.push('licence future');
          }

          if (problems.length) failures.push(`${p.dateOfBirth} (${p.age}): ${problems.join('; ')}`);
        }

        expect(failures.slice(0, 5)).toEqual([]);
      }, 30_000);
    }
  });

  describe('Reserved email domains', () => {
    it('only uses reserved example/test domains for personal and work emails', () => {
      for (const domain of NepalDataEngine.telecom.testEmailDomains) {
        expect(isReservedEmailDomain(`x@${domain}`)).toBe(true);
      }
      for (let i = 0; i < 300; i++) {
        const p = generateSyntheticPerson(PROFILES[i % PROFILES.length]);
        expect(isReservedEmailDomain(p.email)).toBe(true);
        if (p.workEmail) expect(isReservedEmailDomain(p.workEmail)).toBe(true);
      }
      for (const preset of BUILTIN_PERSONA_PRESETS) {
        const p = generatePersonFromPreset(preset);
        expect(isReservedEmailDomain(p.email)).toBe(true);
        if (p.workEmail) expect(isReservedEmailDomain(p.workEmail)).toBe(true);
      }
    });
  });

  describe('Preset location consistency', () => {
    const presets: PersonaPreset[] = [
      ...BUILTIN_PERSONA_PRESETS,
      {
        id: 'test-dolpa-farmer',
        name: 'Dolpa Farmer',
        baseProfile: 'farmer',
        district: 'Dolpa',
        createdAt: 0,
        updatedAt: 0,
      },
      {
        id: 'test-province-only',
        name: 'Karnali Teacher',
        baseProfile: 'teacher',
        province: 'Karnali Province',
        createdAt: 0,
        updatedAt: 0,
      },
      {
        id: 'test-municipality-only',
        name: 'Dharan Employee',
        baseProfile: 'employee',
        municipality: 'Dharan',
        createdAt: 0,
        updatedAt: 0,
      },
    ];

    for (const preset of presets) {
      it(`derives every location field from preset "${preset.name}"`, () => {
        for (let i = 0; i < 100; i++) {
          const p = generatePersonFromPreset(preset);
          const addr = p.address;

          if (preset.province) expect(addr.province).toBe(preset.province);
          if (preset.district) expect(addr.district).toBe(preset.district);
          if (preset.municipality) {
            expect(NepalDataEngine.findMunicipality(preset.municipality, preset.district)?.name).toBe(addr.municipality);
          }

          const muni = NepalDataEngine.getMunicipalitiesByDistrict(addr.district).find((m) => m.name === addr.municipality);
          expect(muni).toBeDefined();
          expect(addr.municipalityType).toBe(muni!.type);
          expect(addr.ward).toBeGreaterThanOrEqual(1);
          expect(addr.ward).toBeLessThanOrEqual(muni!.maxWards);
          expect(NepalDataEngine.findDistrict(addr.district)!.province).toBe(addr.province);

          expect(p.permanentAddress).toEqual(addr);
          expect(p.temporaryAddress!.district).not.toBe(addr.district);
          expect(p.telephone.startsWith(`${NepalDataEngine.getAreaCodeForDistrict(addr.district)}-`)).toBe(true);

          expect(p.citizenshipIssueDistrict).toBe(addr.district);
          expect(p.citizenshipIssuedBy).toBe(`District Administration Office, ${addr.district}`);
          expect(p.citizenshipNumber!.startsWith(`${getDistrictCode(addr.district)}-`)).toBe(true);
          if (p.passportIssuedBy) {
            expect(['Department of Passports, Kathmandu', `DAO, ${addr.district}`]).toContain(p.passportIssuedBy);
          }
          if (['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Kaski', 'Morang', 'Chitwan', 'Rupandehi'].indexOf(addr.district) === -1) {
            expect(p.bankBranch).toBe(`${addr.district} Branch`);
          }
          if (p.cooperative && !preset.cooperative) {
            expect(p.cooperative.startsWith(addr.municipality.replace(/ (Sub-Metropolitan City|Metropolitan City|Rural Municipality|Municipality)$/, ''))).toBe(true);
          }

          const dev = p.devanagari!;
          expect(dev.district).toBe(DISTRICTS_DEVANAGARI[addr.district]);
          expect(dev.municipality).toBe(muni!.nameNp);
          expect(dev.citizenshipIssueDistrict).toBe(DISTRICTS_DEVANAGARI[addr.district]);
          expect(LATIN.test(dev.bankBranch!)).toBe(false);
        }
      });
    }

    it('resolves preset bank names by short name and keeps Devanagari in sync', () => {
      expect(findCommercialBank('Nabil Bank')?.nameEn).toBe('Nabil Bank Limited');
      expect(findCommercialBank('global ime bank')?.nameEn).toBe('Global IME Bank Limited');
      expect(findCommercialBank('NIMB')?.nameEn).toBe('Nepal Investment Mega Bank Limited');
      expect(findCommercialBank('Unknown Bank')).toBeUndefined();

      const preset: PersonaPreset = {
        id: 'bank-test',
        name: 'Bank Test',
        baseProfile: 'employee',
        bankName: 'Global IME Bank',
        createdAt: 0,
        updatedAt: 0,
      };
      const p = generatePersonFromPreset(preset);
      const bank = COMMERCIAL_BANKS.find((b) => b.shortName === 'Global IME Bank')!;
      expect(p.bankName).toBe(bank.nameEn);
      expect(p.bankAccountNumber).toHaveLength(bank.accountLength);
      expect(p.devanagari?.bankName).toBe(bank.nameNp);

      const custom = generatePersonFromPreset({ ...preset, bankName: 'My Local Cooperative Bank' });
      expect(custom.bankName).toBe('My Local Cooperative Bank');
      expect(custom.devanagari?.bankName).not.toBe('नबिल बैंक लिमिटेड');
      expect(LATIN.test(custom.devanagari!.bankName!)).toBe(false);
    });

    it('keeps a user-supplied unknown municipality verbatim inside the chosen district', () => {
      const addr = generateNepalAddress(undefined, false, 'Kaski', 'Hemja Tole Municipality');
      expect(addr.district).toBe('Kaski');
      expect(addr.municipality).toBe('Hemja Tole Municipality');
      expect(addr.ward).toBeLessThanOrEqual(9);
    });
  });

  describe('Devanagari output', () => {
    it('has Devanagari for every first name and surname in the dataset', () => {
      const missing = [
        ...NepalDataEngine.maleNames.filter((n) => !FIRST_NAMES_DEVANAGARI[n]),
        ...NepalDataEngine.femaleNames.filter((n) => !FIRST_NAMES_DEVANAGARI[n]),
        ...NepalDataEngine.surnames.filter((n) => !SURNAMES_DEVANAGARI[n]),
        ...NepalDataEngine.toles.filter((t) => !TOLES_DEVANAGARI[t]),
      ];
      expect(missing).toEqual([]);
    });

    it('contains no Latin letters in name, address and profile fields for np output', () => {
      const fields: Array<keyof NonNullable<SyntheticPerson['devanagari']>> = [
        'firstName', 'lastName', 'fullName', 'province', 'district', 'municipality', 'ward', 'tole', 'fullAddress',
        'permanentFullAddress', 'tempFullAddress', 'currentFullAddress', 'occupation', 'jobTitle', 'department',
        'companyName', 'designation', 'businessName', 'businessType', 'school', 'grade', 'faculty', 'guardianName',
        'cropType', 'cooperative', 'subject', 'citizenshipIssueDistrict', 'citizenshipIssuedBy', 'passportIssuedBy',
        'drivingLicenseCategory', 'bankName', 'bankBranch', 'bankAccountName',
      ];
      const failures: string[] = [];
      for (let i = 0; i < 1200; i++) {
        const p = generateSyntheticPerson(PROFILES[i % PROFILES.length]);
        for (const f of fields) {
          const v = p.devanagari![f];
          if (typeof v === 'string' && LATIN.test(v)) failures.push(`${f}: ${v}`);
        }
      }
      expect([...new Set(failures)].slice(0, 10)).toEqual([]);
    });

    it('maps archetype values correctly', () => {
      const base = generateSyntheticPerson('farmer');
      const withCrop = (cropType: string) => generateDevanagariDetails({ ...base, cropType }).cropType;
      expect(withCrop('Large Cardamom (Alainchi)')).toBe('अलैंची');
      expect(withCrop('Himalayan Coffee')).toBe('हिमाली कफी');
      expect(withCrop('Paddy (Dhan)')).toBe('धान');

      const biz = generateSyntheticPerson('business');
      expect(generateDevanagariDetails({ ...biz, businessType: 'Proprietorship' }).businessType).toBe('एकल स्वामित्व');
      expect(generateDevanagariDetails({ ...biz, businessType: 'Private Limited' }).businessType).toBe('प्राइभेट लिमिटेड');

      const emp = generateSyntheticPerson('employee');
      expect(generateDevanagariDetails({ ...emp, companyName: 'Kathmandu University' }).companyName).toBe('काठमाडौँ विश्वविद्यालय');
      expect(generateDevanagariDetails({ ...emp, companyName: 'Pokhara University' }).companyName).toBe('पोखरा विश्वविद्यालय');
      expect(generateDevanagariDetails({ ...emp, drivingLicenseCategory: 'Category K (Scooter)' }).drivingLicenseCategory).toContain("'ट'");
      expect(generateDevanagariDetails({ ...emp, drivingLicenseCategory: 'Category A (Motorcycle)' }).drivingLicenseCategory).toContain("'क'");
      expect(generateDevanagariDetails({ ...emp, bankBranch: 'Lakeside Branch, Pokhara' }).bankBranch).toBe('लेकसाइड शाखा, पोखरा');
    });

    it('generates business names without trailing whitespace', () => {
      for (let i = 0; i < 100; i++) {
        const biz = generateSyntheticPerson('business');
        expect(biz.businessName).toBe(biz.businessName!.trim());
      }
    });

    it('strips every local-level suffix from farmer cooperative names', () => {
      for (let i = 0; i < 200; i++) {
        const farmer = generateSyntheticPerson('farmer');
        expect(farmer.cooperative).not.toMatch(/Metropolitan|Municipality/);
      }
      const p = generatePersonFromPreset({
        id: 'ktm-farmer', name: 'KTM Farmer', baseProfile: 'farmer', municipality: 'Kathmandu Metropolitan City', createdAt: 0, updatedAt: 0,
      });
      expect(p.cooperative).toBe('Kathmandu Sana Kisan Agriculture Cooperative Ltd.');
      expect(p.devanagari?.cooperative).toBe('काठमाडौँ साना किसान कृषि सहकारी संस्था लि.');
    });
  });

  describe('Transliteration helper', () => {
    it('transliterates simple Latin words phonetically', () => {
      expect(transliterateLatin('Hari')).toBe('हरि');
      expect(transliterateLatin('Raam')).toBe('राम');
      expect(transliterateLatin('Ganesh')).toBe('गनेश');
      expect(transliterateLatin('Shyaam')).toBe('श्याम');
      expect(transliterateLatin('Kiran')).toBe('किरन');
      expect(transliterateLatin('Chowk')).toBe('चोक');
      expect(transliterateLatin('2081')).toBe('२०८१');
    });

    it('never leaves Latin letters in transliterated text', () => {
      const samples = ['QA Super Administrator', 'Retail & FMCG Distribution', 'Birat Trade Syndicate', 'Bachelor 3rd Year', 'Xylophone Zebra Quartz'];
      for (const s of samples) {
        expect(LATIN.test(transliterateText(s))).toBe(false);
      }
      expect(transliterateText('QA Super Administrator')).toBe('क्यूए सुपर प्रशासक');
    });

    it('uses official Devanagari municipality names and handles Sub-Metropolitan suffixes', () => {
      expect(transliterateMunicipality('Butwal Sub-Metropolitan City')).toBe('बुटवल उपमहानगरपालिका');
      expect(transliterateMunicipality('Phidim Municipality')).toBe('फिदिम नगरपालिका');
      expect(transliterateMunicipality('Foo Sub-Metropolitan City')).toMatch(/उपमहानगरपालिका$/);
    });
  });
});
