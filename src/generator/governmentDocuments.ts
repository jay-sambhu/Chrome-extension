import { splitBsDate } from './nepaliCalendar';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sample<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 77 Official Nepal District Codes (01 to 77) mapped by standard English district name.
 */
export const DISTRICT_CODES: Record<string, string> = {
  // Koshi Province (01 - 14)
  Taplejung: '01',
  Panchthar: '02',
  Ilam: '03',
  Jhapa: '04',
  Morang: '05',
  Sunsari: '06',
  Dhankuta: '07',
  Terhathum: '08',
  Sankhuwasabha: '09',
  Bhojpur: '10',
  Solukhumbu: '11',
  Okhaldhunga: '12',
  Khotang: '13',
  Udayapur: '14',

  // Madhesh Province (15 - 22)
  Saptari: '15',
  Siraha: '16',
  Dhanusha: '17',
  Mahottari: '18',
  Sarlahi: '19',
  Rautahat: '20',
  Bara: '21',
  Parsa: '22',

  // Bagmati Province (23 - 35)
  Dolakha: '23',
  Ramechhap: '24',
  Sindhuli: '25',
  Rasuwa: '26',
  Dhading: '27',
  Nuwakot: '28',
  Kathmandu: '29',
  Bhaktapur: '30',
  Lalitpur: '31',
  Kavrepalanchok: '32',
  Sindhupalchok: '33',
  Makwanpur: '34',
  Chitwan: '35',

  // Gandaki Province (36 - 46)
  Gorkha: '36',
  Manang: '37',
  Mustang: '38',
  Myagdi: '39',
  Kaski: '40',
  Lamjung: '41',
  Tanahun: '42',
  Nawalpur: '43',
  Syangja: '44',
  Parbat: '45',
  Baglung: '46',

  // Lumbini Province (47 - 58)
  RukumEast: '47',
  'Rukum East': '47',
  Rolpa: '48',
  Pyuthan: '49',
  Gulmi: '50',
  Arghakhanchi: '51',
  Palpa: '52',
  Parasi: '53',
  'Nawalparasi West': '53',
  Rupandehi: '54',
  Kapilvastu: '55',
  Dang: '56',
  Banke: '57',
  Bardiya: '58',

  // Karnali Province (59 - 68)
  Dolpa: '59',
  Mugu: '60',
  Humla: '61',
  Jumla: '62',
  Kalikot: '63',
  Dailekh: '64',
  Jajarkot: '65',
  RukumWest: '66',
  'Rukum West': '66',
  Salyan: '67',
  Surkhet: '68',

  // Sudurpashchim Province (69 - 77)
  Bajura: '69',
  Bajhang: '70',
  Darchula: '71',
  Baitadi: '72',
  Dadeldhura: '73',
  Doti: '74',
  Achham: '75',
  Kailali: '76',
  Kanchanpur: '77',
};

/**
 * Maps province names to 2-digit DoTM province codes.
 */
export const PROVINCE_CODES: Record<string, string> = {
  'Koshi Province': '01',
  'Madhesh Province': '02',
  'Bagmati Province': '03',
  'Gandaki Province': '04',
  'Lumbini Province': '05',
  'Karnali Province': '06',
  'Sudurpashchim Province': '07',
};

/**
 * Returns the 2-digit district code for a given district name.
 */
export function getDistrictCode(districtName: string): string {
  const clean = districtName.trim();
  if (DISTRICT_CODES[clean]) {
    return DISTRICT_CODES[clean];
  }
  const key = Object.keys(DISTRICT_CODES).find(
    (k) => k.toLowerCase() === clean.toLowerCase()
  );
  return key ? DISTRICT_CODES[key] : '29';
}

export interface CitizenshipDetails {
  citizenshipNumber: string;
  citizenshipIssueDistrict: string;
  citizenshipIssueDateBS: string;
  citizenshipIssuedBy: string;
}

/**
 * Generates verified Nepali citizenship details mathematically verified after the birth year.
 * In Nepal, eligibility for citizenship begins at age 16 BS.
 */
export function generateCitizenshipDetails(
  permanentDistrict: string,
  dobBS?: string
): CitizenshipDetails {
  const currentBSYear = 2081;
  let birthYearBS = 2055;

  if (dobBS) {
    const parsed = parseInt(splitBsDate(dobBS).year, 10);
    if (!isNaN(parsed) && parsed > 2000 && parsed < currentBSYear) {
      birthYearBS = parsed;
    }
  }

  // Issue year is at least 16 years after birth year
  const minIssueYear = birthYearBS + 16;
  const maxIssueYear = Math.min(currentBSYear, birthYearBS + 24);
  const issueYear = minIssueYear <= maxIssueYear
    ? randInt(minIssueYear, maxIssueYear)
    : minIssueYear;

  const month = randInt(1, 12).toString().padStart(2, '0');
  const day = randInt(1, 28).toString().padStart(2, '0');
  const issueDateBS = `${issueYear}-${month}-${day}`;

  const distCode = getDistrictCode(permanentDistrict);
  const typeCode = '01'; // Descendant / वंशज
  const yearSuffix = issueYear.toString().slice(-2);
  const serial = randInt(10000, 99999);
  const citizenshipNumber = `${distCode}-${typeCode}-${yearSuffix}-${serial}`;

  return {
    citizenshipNumber,
    citizenshipIssueDistrict: permanentDistrict,
    citizenshipIssueDateBS: issueDateBS,
    citizenshipIssuedBy: `District Administration Office, ${permanentDistrict}`,
  };
}

/**
 * Generates a standard 10-digit National ID (राष्ट्रिय परिचयपत्र / NID) number.
 */
export function generateNationalId(formatted = false): string {
  const part1 = randInt(100, 999).toString();
  const part2 = randInt(100, 999).toString();
  const part3 = randInt(1000, 9999).toString();
  return formatted ? `${part1}-${part2}-${part3}` : `${part1}${part2}${part3}`;
}

export interface PassportDetails {
  passportNumber: string;
  passportIssueDate: string;
  passportExpiryDate: string;
  passportIssuedBy: string;
}

/**
 * Generates ordinary Nepal MRP/e-Passport details.
 * Passport validity is 10 years for adult citizens.
 */
export function generatePassportDetails(
  permanentDistrict: string,
  dobAD?: string
): PassportDetails {
  const currentYear = new Date().getFullYear();
  let birthYear = 1998;

  if (dobAD) {
    const parts = dobAD.split('-');
    const parsed = parseInt(parts[0], 10);
    if (!isNaN(parsed) && parsed > 1940 && parsed < currentYear) {
      birthYear = parsed;
    }
  }

  // Passports issued within the last 1 to 8 years, but after age 16
  const minIssueYear = Math.max(birthYear + 16, currentYear - 8);
  const maxIssueYear = currentYear - 1;
  const issueYear = minIssueYear <= maxIssueYear
    ? randInt(minIssueYear, maxIssueYear)
    : currentYear - 2;

  const month = randInt(1, 12).toString().padStart(2, '0');
  const day = randInt(1, 28).toString().padStart(2, '0');
  const issueDate = `${issueYear}-${month}-${day}`;

  // 10-year validity
  const expiryYear = issueYear + 10;
  const expiryDay = (Math.max(1, parseInt(day, 10) - 1)).toString().padStart(2, '0');
  const expiryDate = `${expiryYear}-${month}-${expiryDay}`;

  // Series PA or PC + 7 digits (ordinary passport in Nepal)
  const series = sample(['PA', 'PC']);
  const number = randInt(1000000, 9999999).toString();
  const passportNumber = `${series}${number}`;

  const issuedBy =
    Math.random() > 0.4
      ? 'Department of Passports, Kathmandu'
      : `DAO, ${permanentDistrict}`;

  return {
    passportNumber,
    passportIssueDate: issueDate,
    passportExpiryDate: expiryDate,
    passportIssuedBy: issuedBy,
  };
}

export interface DrivingLicenseDetails {
  drivingLicenseNumber: string;
  drivingLicenseCategory: string;
  drivingLicenseIssueDate: string;
  drivingLicenseExpiryDate: string;
}

export const DRIVING_LICENSE_CATEGORIES = [
  'Category A (Motorcycle)',
  'Category B (Car/Jeep/Van)',
  'Category A, B (Motorcycle & Car)',
  'Category K (Scooter)',
];

/**
 * Generates DoTM Nepal Smart Driving License details (format: 01-06-XXXXXXXX).
 * Valid for 5 years in Nepal.
 */
export function generateDrivingLicenseDetails(
  provinceName?: string
): DrivingLicenseDetails {
  const provCode = (provinceName && PROVINCE_CODES[provinceName]) || '03';
  const officeCode = randInt(1, 8).toString().padStart(2, '0');
  const serial = randInt(100000, 999999).toString().padStart(8, '0');
  const drivingLicenseNumber = `${provCode}-${officeCode}-${serial}`;

  const drivingLicenseCategory = sample(DRIVING_LICENSE_CATEGORIES);

  const currentYear = new Date().getFullYear();
  const issueYear = currentYear - randInt(1, 4);
  const month = randInt(1, 12).toString().padStart(2, '0');
  const day = randInt(1, 28).toString().padStart(2, '0');
  const issueDate = `${issueYear}-${month}-${day}`;
  const expiryDate = `${issueYear + 5}-${month}-${day}`;

  return {
    drivingLicenseNumber,
    drivingLicenseCategory,
    drivingLicenseIssueDate: issueDate,
    drivingLicenseExpiryDate: expiryDate,
  };
}
