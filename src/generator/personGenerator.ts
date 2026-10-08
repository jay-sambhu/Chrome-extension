import {
  NepalDataEngine,
  Province,
  District,
  Municipality,
} from './nepalDataEngine';
import { Gender, NepalAddress, ProfileType, SyntheticPerson } from '../types';
import { generateDevanagariDetails } from './devanagariEngine';
import { convertAdToBs } from './nepaliCalendar';
import {
  generateCitizenshipDetails,
  generateNationalId,
  generatePassportDetails,
  generateDrivingLicenseDetails,
} from './governmentDocuments';

function sample<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateNepalAddress(targetProvince?: string, preferRural = false): NepalAddress {
  const province: Province = targetProvince
    ? NepalDataEngine.getProvinces().find((p) => p.name === targetProvince) || NepalDataEngine.getRandomProvince()
    : NepalDataEngine.getRandomProvince();

  const district: District = NepalDataEngine.getRandomDistrict(province.name);
  const municipality: Municipality = NepalDataEngine.getRandomMunicipality(
    district.name,
    preferRural ? 'Rural Municipality' : undefined
  );
  const ward = NepalDataEngine.getRandomWard(municipality);
  const tole = NepalDataEngine.getRandomTole();

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

/**
 * Generates a coherent temporary/current address distinct from the permanent address.
 * Simulates typical Nepali domestic migration towards major urban hubs (e.g. Kathmandu Valley,
 * Pokhara, Chitwan, Biratnagar, Butwal).
 */
export function generateDistinctTemporaryAddress(permanentAddress: NepalAddress): NepalAddress {
  const urbanDestinations: Array<{ province: string; district: string; municipality: string }> = [
    { province: 'Bagmati Province', district: 'Kathmandu', municipality: 'Kathmandu Metropolitan City' },
    { province: 'Bagmati Province', district: 'Lalitpur', municipality: 'Lalitpur Metropolitan City' },
    { province: 'Bagmati Province', district: 'Bhaktapur', municipality: 'Bhaktapur Municipality' },
    { province: 'Bagmati Province', district: 'Kathmandu', municipality: 'Budhanilkantha Municipality' },
    { province: 'Gandaki Province', district: 'Kaski', municipality: 'Pokhara Metropolitan City' },
    { province: 'Bagmati Province', district: 'Chitwan', municipality: 'Bharatpur Metropolitan City' },
    { province: 'Koshi Province', district: 'Morang', municipality: 'Biratnagar Metropolitan City' },
    { province: 'Lumbini Province', district: 'Rupandehi', municipality: 'Butwal Sub-Metropolitan City' },
  ];

  // Filter out any destination that matches the permanent district
  const eligible = urbanDestinations.filter((d) => d.district !== permanentAddress.district);
  const dest = eligible.length > 0 ? sample(eligible) : sample(urbanDestinations);

  const district =
    NepalDataEngine.districts.find((d) => d.name === dest.district && d.province === dest.province) ||
    NepalDataEngine.getRandomDistrict(dest.province);
  const municipality =
    NepalDataEngine.municipalities.find((m) => m.name === dest.municipality && m.district === district.name) ||
    NepalDataEngine.getRandomMunicipality(district.name);

  const ward = NepalDataEngine.getRandomWard(municipality);
  const tole = NepalDataEngine.getRandomTole();

  const cleanMunicipality = municipality.name
    .replace(' Metropolitan City', '')
    .replace(' Sub-Metropolitan City', '')
    .replace(' Rural Municipality', '')
    .replace(' Municipality', '');

  const fullAddress = `${tole}, Ward-${ward}, ${cleanMunicipality}, ${district.name}, ${dest.province}`;

  return {
    province: dest.province,
    district: district.name,
    municipality: municipality.name,
    municipalityType: municipality.type,
    ward,
    tole,
    fullAddress,
  };
}

/**
 * Generates both permanent and temporary addresses simultaneously.
 */
export function generateDualNepalAddresses(preferRuralPermanent = false): {
  permanentAddress: NepalAddress;
  temporaryAddress: NepalAddress;
} {
  const permanentAddress = generateNepalAddress(undefined, preferRuralPermanent);
  const temporaryAddress = generateDistinctTemporaryAddress(permanentAddress);
  return { permanentAddress, temporaryAddress };
}

export function generateNepaliPhone(): string {
  const prefix = NepalDataEngine.getRandomMobilePrefix();
  const suffix = Math.floor(1000000 + Math.random() * 9000000).toString().slice(0, 7);
  return `${prefix}${suffix}`;
}

export function generateNepaliTelephone(districtName?: string): string {
  const areaCode = districtName ? NepalDataEngine.getAreaCodeForDistrict(districtName) : '01';
  // Area codes with 2 digits (e.g. 01) get 7-digit subscriber numbers; 3 digits get 6-digit subscriber numbers
  const subLength = areaCode.length === 2 ? 7 : 6;
  const min = Math.pow(10, subLength - 1) * 4;
  const max = Math.pow(10, subLength) - 1;
  const subscriberNumber = randInt(min, max);
  return `${areaCode}-${subscriberNumber}`;
}

export function generateDateOfBirth(minAge = 20, maxAge = 55): { dob: string; age: number } {
  const currentYear = new Date().getFullYear();
  const age = randInt(minAge, maxAge);
  const birthYear = currentYear - age;
  const month = randInt(1, 12).toString().padStart(2, '0');
  const day = randInt(1, 28).toString().padStart(2, '0');
  return {
    dob: `${birthYear}-${month}-${day}`,
    age,
  };
}

export { convertAdToBs } from './nepaliCalendar';
export {
  generateCitizenshipDetails,
  generatePassportDetails,
  generateDrivingLicenseDetails,
} from './governmentDocuments';

export function generateCitizenshipNumber(districtName?: string, dobBS?: string): string {
  if (districtName) {
    return generateCitizenshipDetails(districtName, dobBS).citizenshipNumber;
  }
  const distCode = randInt(1, 77).toString().padStart(2, '0');
  const typeCode = '01';
  const bsYr = randInt(50, 80).toString().padStart(2, '0');
  const serial = randInt(10000, 99999);
  return `${distCode}-${typeCode}-${bsYr}-${serial}`;
}

export { generateNationalId } from './governmentDocuments';

export function generatePanNumber(): string {
  // 9-digit PAN number format used in Nepal (Inland Revenue Department)
  return Math.floor(100000000 + Math.random() * 900000000).toString();
}

export function generateSyntheticPerson(
  profileType: ProfileType = 'general',
  forcedGender?: Gender
): SyntheticPerson {
  const gender: Gender = forcedGender || (Math.random() > 0.48 ? 'Male' : 'Female');
  const firstName = gender === 'Male'
    ? NepalDataEngine.getRandomMaleName()
    : gender === 'Female'
    ? NepalDataEngine.getRandomFemaleName()
    : sample([...NepalDataEngine.maleNames, ...NepalDataEngine.femaleNames]);

  const lastName = NepalDataEngine.getRandomSurname();
  const fullName = `${firstName} ${lastName}`;

  // Age bracket based on profile archetype
  let minAge = 22;
  let maxAge = 55;
  if (profileType === 'student') {
    minAge = 16;
    maxAge = 24;
  } else if (profileType === 'employee') {
    minAge = 23;
    maxAge = 58;
  } else if (profileType === 'business') {
    minAge = 28;
    maxAge = 65;
  } else if (profileType === 'teacher') {
    minAge = 25;
    maxAge = 62;
  } else if (profileType === 'farmer') {
    minAge = 28;
    maxAge = 68;
  }

  const { dob, age } = generateDateOfBirth(minAge, maxAge);

  // Honorific
  const honorific = gender === 'Male' ? 'Mr.' : age > 28 ? 'Mrs.' : 'Ms.';

  // Address and district-coupled landline
  const address = generateNepalAddress(undefined, profileType === 'farmer');
  const temporaryAddress = generateDistinctTemporaryAddress(address);
  const phone = generateNepaliPhone();
  const telephone = generateNepaliTelephone(address.district);

  const domain = NepalDataEngine.getRandomTestEmailDomain();
  const numSuffix = randInt(11, 99);
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${numSuffix}@${domain}`;

  const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}${randInt(10, 999)}`;
  const password = `Np@Test!${randInt(1000, 9999)}`;

  const dobBS = convertAdToBs(dob);

  // Default professional fields
  let occupation = 'Professional';
  let jobTitle = 'Officer';
  let department = 'Operations';
  let companyName = sample(NepalDataEngine.companies).name;

  // Archetype specific enrichment
  let studentId: string | undefined;
  let school: string | undefined;
  let grade: string | undefined;
  let guardianName: string | undefined;
  let guardianPhone: string | undefined;

  let employeeId: string | undefined;
  let workEmail: string | undefined;
  let panNumber: string | undefined;
  let designation: string | undefined;
  let salary: string | undefined;

  let businessName: string | undefined;
  let businessType: string | undefined;
  let vatNumber: string | undefined;
  let registeredAddress: string | undefined;

  let subject: string | undefined;
  let faculty: string | undefined;

  let cooperative: string | undefined;
  let cropType: string | undefined;

  if (profileType === 'student') {
    occupation = 'Student';
    jobTitle = 'Student';
    department = 'Academic Affairs';
    const inst = age >= 19
      ? NepalDataEngine.getRandomInstitution('University')
      : age >= 17
      ? NepalDataEngine.getRandomInstitution('College')
      : NepalDataEngine.getRandomInstitution('School');

    companyName = inst.name;
    school = inst.name;
    studentId = `STU-${new Date().getFullYear()}-${randInt(1000, 9999)}`;
    grade = age >= 21 ? 'Masters Degree' : age >= 18 ? 'Bachelors Degree' : 'Grade 12';
    const studentFaculties = [
      'Faculty of Science & Technology',
      'Faculty of Management',
      'Faculty of Humanities & Social Sciences',
      'Institute of Engineering',
      'Institute of Medicine',
    ];
    faculty = sample(studentFaculties);
    const guardianFirstName = NepalDataEngine.getRandomMaleName();
    guardianName = `${guardianFirstName} ${lastName}`;
    guardianPhone = generateNepaliPhone();
  } else if (profileType === 'employee') {
    const occ = NepalDataEngine.getRandomOccupation();
    occupation = occ.title;
    jobTitle = occ.title;
    department = occ.department;
    companyName = NepalDataEngine.getRandomCompany(occ.companyType).name;
    designation = occ.title;
    employeeId = `EMP-${randInt(10000, 99999)}`;
    const cleanComp = companyName.toLowerCase().replace(/[^a-z]/g, '').slice(0, 10);
    workEmail = `${firstName.toLowerCase()}@${cleanComp}.com.np`;
    panNumber = generatePanNumber();
    salary = `${randInt(35, 180)},000 NPR`;
  } else if (profileType === 'business') {
    occupation = 'Business Owner / Entrepreneur';
    jobTitle = 'Managing Director';
    department = 'Executive Management';
    businessType = sample(['Private Limited', 'Proprietorship', 'Partnership Firm']);
    businessName = `${lastName} ${sample(['Enterprises', 'Trading Concern', 'Innovations', 'Suppliers', 'Group'])} ${businessType === 'Private Limited' ? 'Pvt. Ltd.' : ''}`;
    companyName = businessName;
    panNumber = generatePanNumber();
    vatNumber = `VAT-${panNumber}`;
    registeredAddress = address.fullAddress;
  } else if (profileType === 'teacher') {
    const subjects = ['Mathematics', 'Physics', 'English Literature', 'Nepali', 'Social Studies', 'Computer Science', 'Economics', 'Chemistry'];
    subject = sample(subjects);
    faculty = subject.includes('Physics') || subject.includes('Mathematics') || subject.includes('Computer')
      ? 'Faculty of Science & Technology'
      : 'Faculty of Humanities & Social Sciences';
    occupation = age > 35 ? 'Senior Lecturer' : 'Teacher';
    jobTitle = occupation;
    department = `Department of ${subject}`;
    const inst = sample(NepalDataEngine.institutions);
    companyName = inst.name;
    school = inst.name;
    employeeId = `FAC-${randInt(1000, 9999)}`;
    panNumber = generatePanNumber();
  } else if (profileType === 'farmer') {
    occupation = 'Farmer / Agriculturalist';
    jobTitle = 'Lead Farmer';
    department = 'Agricultural Operations';
    const crops = ['Paddy (Dhan)', 'Maize (Makai)', 'Organic Tea', 'Large Cardamom (Alainchi)', 'Himalayan Coffee', 'Dairy Farming', 'Vegetable Farming'];
    cropType = sample(crops);
    const cleanMuni = address.municipality.replace(/ (Rural )?Municipality.*/, '');
    cooperative = `${cleanMuni} Sana Kisan Agriculture Cooperative Ltd.`;
    companyName = cooperative;
  } else {
    // General person
    const occ = NepalDataEngine.getRandomOccupation();
    occupation = occ.title;
    jobTitle = occ.title;
    department = occ.department;
    companyName = NepalDataEngine.getRandomCompany(occ.companyType).name;
    panNumber = generatePanNumber();
  }

  const citizenship = generateCitizenshipDetails(address.district, dobBS);
  const nationalId = generateNationalId();
  const passport = generatePassportDetails(address.district, dob);
  const drivingLicense = generateDrivingLicenseDetails(address.province);

  const person: SyntheticPerson = {
    profileType,
    honorific,
    firstName,
    lastName,
    fullName,
    gender,
    dateOfBirth: dob,
    dateOfBirthBS: dobBS,
    age,
    phone,
    telephone,
    email,
    address,
    permanentAddress: address,
    temporaryAddress,
    currentAddress: temporaryAddress,
    occupation,
    jobTitle,
    department,
    companyName,
    username,
    password,

    studentId,
    school,
    grade,
    guardianName,
    guardianPhone,

    employeeId,
    workEmail,
    panNumber,
    designation,
    salary,

    businessName,
    businessType,
    vatNumber,
    registeredAddress,

    subject,
    faculty,

    cooperative,
    cropType,

    // Verified Government Documents
    citizenshipNumber: citizenship.citizenshipNumber,
    citizenshipIssueDistrict: citizenship.citizenshipIssueDistrict,
    citizenshipIssueDateBS: citizenship.citizenshipIssueDateBS,
    citizenshipIssuedBy: citizenship.citizenshipIssuedBy,

    nationalId,

    passportNumber: passport.passportNumber,
    passportIssueDate: passport.passportIssueDate,
    passportExpiryDate: passport.passportExpiryDate,
    passportIssuedBy: passport.passportIssuedBy,

    drivingLicenseNumber: drivingLicense.drivingLicenseNumber,
    drivingLicenseCategory: drivingLicense.drivingLicenseCategory,
    drivingLicenseIssueDate: drivingLicense.drivingLicenseIssueDate,
    drivingLicenseExpiryDate: drivingLicense.drivingLicenseExpiryDate,
  };

  person.devanagari = generateDevanagariDetails(person);

  return person;
}
