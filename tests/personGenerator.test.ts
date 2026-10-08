import { describe, it, expect } from 'vitest';
import { generateSyntheticPerson, generateNepaliPhone, generateDateOfBirth } from '../src/generator/personGenerator';
import { NEPAL_GEOGRAPHY, PHONE_PREFIXES } from '../src/generator/nepalData';

describe('Synthetic Person Generator', () => {
  it('generates a complete synthetic person with all required fields', () => {
    const person = generateSyntheticPerson();

    expect(person.fullName).toBe(`${person.firstName} ${person.lastName}`);
    expect(['Male', 'Female', 'Other']).toContain(person.gender);
    expect(person.age).toBeGreaterThanOrEqual(18);
    expect(person.dateOfBirth).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(person.email).toContain('@');
    expect(person.username.length).toBeGreaterThan(3);
    expect(person.password.length).toBeGreaterThan(6);
    expect(person.occupation).toBeTruthy();
    expect(person.companyName).toBeTruthy();
  });

  it('generates realistic 10-digit Nepali phone numbers with valid prefixes', () => {
    for (let i = 0; i < 20; i++) {
      const phone = generateNepaliPhone();
      expect(phone).toMatch(/^9[78]\d{8}$/);
      const prefix = phone.substring(0, 3);
      expect(PHONE_PREFIXES).toContain(prefix);
    }
  });

  it('generates internally consistent Nepal addresses', () => {
    for (let i = 0; i < 20; i++) {
      const person = generateSyntheticPerson();
      const addr = person.address;

      const province = NEPAL_GEOGRAPHY.find((p) => p.name === addr.province);
      expect(province).toBeDefined();

      const district = province!.districts.find((d) => d.name === addr.district);
      expect(district).toBeDefined();

      const municipality = district!.municipalities.find((m) => m.name === addr.municipality);
      expect(municipality).toBeDefined();

      expect(addr.ward).toBeGreaterThanOrEqual(1);
      expect(addr.ward).toBeLessThanOrEqual(municipality!.maxWards);
      expect(addr.fullAddress).toContain(addr.province);
      expect(addr.fullAddress).toContain(addr.district);
    }
  });

  it('calculates birth year consistent with age', () => {
    const currentYear = new Date().getFullYear();
    const { dob, age } = generateDateOfBirth(25, 30);
    const birthYear = parseInt(dob.split('-')[0], 10);
    expect(currentYear - birthYear).toBe(age);
  });
});
