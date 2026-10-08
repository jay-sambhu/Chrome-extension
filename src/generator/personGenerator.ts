import {
  NEPAL_GEOGRAPHY,
  MALE_FIRST_NAMES,
  FEMALE_FIRST_NAMES,
  SURNAMES,
  OCCUPATIONS,
  TOLES,
  PHONE_PREFIXES,
  TEST_EMAIL_DOMAINS,
  ProvinceData,
  DistrictData,
  MunicipalityData,
} from './nepalData';
import { Gender, NepalAddress, SyntheticPerson } from '../types';

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateNepalAddress(): NepalAddress {
  const province: ProvinceData = getRandomElement(NEPAL_GEOGRAPHY);
  const district: DistrictData = getRandomElement(province.districts);
  const municipality: MunicipalityData = getRandomElement(district.municipalities);
  const ward = getRandomInt(1, municipality.maxWards);
  const tole = getRandomElement(TOLES);

  // Short city name without suffix for natural address representation
  const cleanMunicipality = municipality.name
    .replace(' Metropolitan City', '')
    .replace(' Sub-Metropolitan City', '')
    .replace(' Rural Municipality', '')
    .replace(' Municipality', '');

  const fullAddress = `${tole}, Ward-${ward}, ${cleanMunicipality}, ${district.name}, ${province.name}`;

  return {
    province: province.name,
    district: district.name,
    municipality: municipality.name,
    municipalityType: municipality.type,
    ward,
    tole,
    fullAddress,
  };
}

export function generateNepaliPhone(): string {
  const prefix = getRandomElement(PHONE_PREFIXES);
  const suffix = Math.floor(1000000 + Math.random() * 9000000).toString().slice(0, 7);
  return `${prefix}${suffix}`;
}

export function generateNepaliTelephone(): string {
  const localNum = Math.floor(4000000 + Math.random() * 5000000).toString();
  return `01-${localNum}`;
}

export function generateDateOfBirth(minAge = 20, maxAge = 55): { dob: string; age: number } {
  const currentYear = new Date().getFullYear();
  const age = getRandomInt(minAge, maxAge);
  const birthYear = currentYear - age;
  const month = getRandomInt(1, 12).toString().padStart(2, '0');
  const day = getRandomInt(1, 28).toString().padStart(2, '0');
  return {
    dob: `${birthYear}-${month}-${day}`,
    age,
  };
}

export function generateSyntheticPerson(forcedGender?: Gender): SyntheticPerson {
  const gender: Gender = forcedGender || (Math.random() > 0.5 ? 'Male' : 'Female');
  const firstName = gender === 'Male'
    ? getRandomElement(MALE_FIRST_NAMES)
    : gender === 'Female'
    ? getRandomElement(FEMALE_FIRST_NAMES)
    : getRandomElement([...MALE_FIRST_NAMES, ...FEMALE_FIRST_NAMES]);

  const lastName = getRandomElement(SURNAMES);
  const fullName = `${firstName} ${lastName}`;

  const { dob, age } = generateDateOfBirth(22, 50);
  const phone = generateNepaliPhone();
  const telephone = generateNepaliTelephone();

  const domain = getRandomElement(TEST_EMAIL_DOMAINS);
  const numSuffix = getRandomInt(11, 99);
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${numSuffix}@${domain}`;

  const address = generateNepalAddress();
  const occ = getRandomElement(OCCUPATIONS);

  const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}${getRandomInt(10, 999)}`;
  const password = `Np@Test!${getRandomInt(1000, 9999)}`;

  return {
    firstName,
    lastName,
    fullName,
    gender,
    dateOfBirth: dob,
    age,
    phone,
    telephone,
    email,
    address,
    occupation: occ.title,
    jobTitle: occ.title,
    department: occ.department,
    companyName: occ.company,
    username,
    password,
  };
}
