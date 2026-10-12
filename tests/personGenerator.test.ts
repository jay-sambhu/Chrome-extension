import { describe, it, expect } from 'vitest';
import {
  generateSyntheticPerson,
  generateNepaliPhone,
  generateNepaliTelephone,
  generateDateOfBirth,
  generatePanNumber,
} from '../src/generator/personGenerator';
import { NepalDataEngine } from '../src/generator/nepalDataEngine';
import { ProfileType } from '../src/types';

const PHONE_PREFIXES = NepalDataEngine.telecom.allMobilePrefixes;

function completedYearsAt(dob: string, today: string): number {
  const [by, bm, bd] = dob.split('-').map(Number);
  const [ty, tm, td] = today.split('-').map(Number);
  return ty - by - (tm < bm || (tm === bm && td < bd) ? 1 : 0);
}

function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

describe('Phase 3 — Synthetic Person Generator & Consistency Engine', () => {
  it('generates date of birth consistent with given age constraints', () => {
    const now = new Date(2026, 9, 12);
    for (let i = 0; i < 500; i++) {
      const { dob, age } = generateDateOfBirth(25, 30, now);
      expect(age).toBeGreaterThanOrEqual(25);
      expect(age).toBeLessThanOrEqual(30);
      expect(completedYearsAt(dob, '2026-10-12')).toBe(age);
    }
  });


  it('generates a complete synthetic person with all required fields', () => {
    const person = generateSyntheticPerson('general');
    expect(person.fullName).toBe(`${person.firstName} ${person.lastName}`);

    expect(['Male', 'Female', 'Other']).toContain(person.gender);
    expect(person.age).toBeGreaterThanOrEqual(18);
    expect(person.dateOfBirth).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(person.email).toContain('@');
    expect(person.username.length).toBeGreaterThan(3);
    expect(person.password.length).toBeGreaterThan(6);
    expect(person.occupation).toBeTruthy();
    expect(person.companyName).toBeTruthy();
    expect(['Mr.', 'Ms.', 'Mrs.', 'Mx.']).toContain(person.honorific);
  });

  it('generates realistic 10-digit Nepali phone numbers with valid prefixes', () => {
    for (let i = 0; i < 50; i++) {
      const phone = generateNepaliPhone();
      expect(phone).toMatch(/^9[78]\d{8}$/);
      const prefix = phone.substring(0, 3);
      expect(PHONE_PREFIXES).toContain(prefix);
    }
  });

  it('couples landline telephone numbers with the district area code', () => {
    const ktmTel = generateNepaliTelephone('Kathmandu');
    expect(ktmTel.startsWith('01-')).toBe(true);

    const kaskiTel = generateNepaliTelephone('Kaski');
    expect(kaskiTel.startsWith('061-')).toBe(true);

    const morangTel = generateNepaliTelephone('Morang');
    expect(morangTel.startsWith('021-')).toBe(true);

    const kailaliTel = generateNepaliTelephone('Kailali');
    expect(kailaliTel.startsWith('091-')).toBe(true);
  });

  it('strictly preserves hierarchical consistency across 1,000 iterations (zero mismatch bugs)', () => {
    for (let i = 0; i < 1000; i++) {
      const person = generateSyntheticPerson();
      const addr = person.address;

      // 1. Province exists
      const province = NepalDataEngine.getProvinces().find((p) => p.name === addr.province);
      expect(province).toBeDefined();

      // 2. District strictly belongs to that province
      const district = NepalDataEngine.getDistrictsByProvince(province!.name).find((d) => d.name === addr.district);
      expect(district).toBeDefined();

      // 3. Municipality belongs to that district
      const municipality = NepalDataEngine.getMunicipalitiesByDistrict(district!.name).find((m) => m.name === addr.municipality);
      expect(municipality).toBeDefined();
      expect(addr.municipalityType).toBe(municipality!.type);

      // 4. Ward is strictly within the valid range
      expect(addr.ward).toBeGreaterThanOrEqual(1);
      expect(addr.ward).toBeLessThanOrEqual(municipality!.maxWards);

      // 5. Landline starts with the district's official area code
      const expectedAreaCode = NepalDataEngine.getAreaCodeForDistrict(addr.district);
      expect(person.telephone.startsWith(`${expectedAreaCode}-`)).toBe(true);

      // 6. Age is the exact completed years for the DOB
      expect(completedYearsAt(person.dateOfBirth, localToday())).toBe(person.age);
    }
  });

  it('generates 9-digit valid PAN numbers', () => {
    for (let i = 0; i < 20; i++) {
      const pan = generatePanNumber();
      expect(pan).toMatch(/^\d{9}$/);
    }
  });

  it('generates consistent archetype profile: student', () => {
    const student = generateSyntheticPerson('student');

    expect(student.profileType).toBe('student');
    expect(student.age).toBeGreaterThanOrEqual(16);
    expect(student.age).toBeLessThanOrEqual(24);
    expect(student.studentId).toMatch(/^STU-\d{4}-\d{4}$/);
    expect(student.school).toBeTruthy();
    expect(student.grade).toBeTruthy();
    expect(student.guardianName).toBeTruthy();
    expect(student.guardianPhone).toMatch(/^9[78]\d{8}$/);
  });

  it('generates consistent archetype profile: employee', () => {
    const employee = generateSyntheticPerson('employee');

    expect(employee.profileType).toBe('employee');
    expect(employee.employeeId).toMatch(/^EMP-\d{5}$/);
    expect(employee.panNumber).toMatch(/^\d{9}$/);
    expect(employee.workEmail).toMatch(/@[a-z0-9]+\.example\.test$/);
    expect(employee.designation).toBeTruthy();
    expect(employee.salary).toContain('NPR');
  });

  it('generates consistent archetype profile: business owner', () => {
    const business = generateSyntheticPerson('business');

    expect(business.profileType).toBe('business');
    expect(business.businessName).toBeTruthy();
    expect(business.businessType).toBeTruthy();
    expect(business.panNumber).toMatch(/^\d{9}$/);
    expect(business.vatNumber).toBe(`VAT-${business.panNumber}`);
    expect(business.registeredAddress).toBe(business.address.fullAddress);
  });

  it('generates consistent archetype profile: teacher', () => {
    const teacher = generateSyntheticPerson('teacher');

    expect(teacher.profileType).toBe('teacher');
    expect(teacher.subject).toBeTruthy();
    expect(teacher.faculty).toBeTruthy();
    expect(teacher.school).toBeTruthy();
    expect(teacher.employeeId).toMatch(/^FAC-\d{4}$/);
  });

  it('generates consistent archetype profile: farmer', () => {
    const farmer = generateSyntheticPerson('farmer');

    expect(farmer.profileType).toBe('farmer');
    expect(farmer.cropType).toBeTruthy();
    expect(farmer.cooperative).toContain('Cooperative');
  });

  it('supports all 6 profile archetypes systematically', () => {
    const archetypes: ProfileType[] = ['general', 'student', 'employee', 'business', 'teacher', 'farmer'];
    archetypes.forEach((arch) => {
      const person = generateSyntheticPerson(arch);
      expect(person.profileType).toBe(arch);
      expect(person.fullName).toBeTruthy();
      expect(person.phone).toMatch(/^9[78]\d{8}$/);
      expect(person.email).toContain('@');
    });
  });
});
