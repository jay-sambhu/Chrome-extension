import {
  adPartsToBs,
  bsPartsToAd,
  convertAdToBs,
  getBsMonthDays,
} from './nepaliCalendar';
import {
  addDays,
  addYears,
  formatAdDate,
  maxDate,
  minDate,
  parseAdDate,
  randomDateBetween,
  todayUtc,
} from './dateUtils';

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

/** Minimum age (completed years) for Nepali citizenship, passport and two-wheeler licences. */
export const MIN_CITIZENSHIP_AGE = 16;
export const MIN_PASSPORT_AGE = 16;
export const MIN_TWO_WHEELER_LICENSE_AGE = 16;
export const MIN_FOUR_WHEELER_LICENSE_AGE = 18;

function parseBsParts(bsDate: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/.exec(bsDate.trim());
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

/**
 * Generates Nepali citizenship details. The issue date is always on or after the holder's
 * 16th birthday (in BS) and never later than today. If the holder is not yet 16 the issue
 * date is clamped to today; callers should not request citizenship for minors.
 */
export function generateCitizenshipDetails(
  permanentDistrict: string,
  dobBS?: string,
  now: Date = new Date()
): CitizenshipDetails {
  const today = todayUtc(now);

  let eligibleFrom: Date | null = null;
  const bs = dobBS ? parseBsParts(dobBS) : null;
  if (bs) {
    const eligibleYear = bs.year + MIN_CITIZENSHIP_AGE;
    const eligibleDay = Math.min(bs.day, getBsMonthDays(eligibleYear, bs.month) || bs.day);
    const ad = bsPartsToAd({ year: eligibleYear, month: bs.month, day: eligibleDay });
    if (ad) eligibleFrom = new Date(Date.UTC(ad.year, ad.month - 1, ad.day));
  }
  if (!eligibleFrom) {
    // Unknown DOB: assume an adult who became eligible 2-12 years ago
    eligibleFrom = addYears(today, -randInt(2, 12));
  }

  const earliest = minDate(eligibleFrom, today);
  const latest = minDate(today, addYears(earliest, 8));
  const issueAd = randomDateBetween(earliest, latest) || earliest;
  const issueBs = adPartsToBs({
    year: issueAd.getUTCFullYear(),
    month: issueAd.getUTCMonth() + 1,
    day: issueAd.getUTCDate(),
  });
  const issueDateBS = issueBs
    ? `${issueBs.year}-${issueBs.month.toString().padStart(2, '0')}-${issueBs.day.toString().padStart(2, '0')}`
    : convertAdToBs(formatAdDate(today));
  const issueYear = issueBs ? issueBs.year : parseInt(issueDateBS.slice(0, 4), 10);

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

function resolveBirthDate(dobAD: string | undefined, today: Date): Date {
  const parsed = dobAD ? parseAdDate(dobAD) : null;
  if (parsed && parsed.getTime() <= today.getTime()) return parsed;
  // Unknown DOB: assume an adult aged 25-45
  return addDays(addYears(today, -randInt(25, 45)), -randInt(0, 364));
}

/**
 * Generates ordinary Nepal MRP/e-Passport details (AD dates).
 * Issued on/after the holder's 16th birthday, within the last 9 years, never in the future.
 * Validity is 10 years (expires the day before the 10th anniversary of issue).
 * Returns undefined when the holder is too young to have been issued a passport.
 */
export function generatePassportDetails(
  permanentDistrict: string,
  dobAD?: string,
  now: Date = new Date()
): PassportDetails | undefined {
  const today = todayUtc(now);
  const birth = resolveBirthDate(dobAD, today);

  const earliest = maxDate(addYears(birth, MIN_PASSPORT_AGE), addYears(today, -9));
  const latest = addDays(today, -1);
  const issue = randomDateBetween(earliest, latest);
  if (!issue) return undefined;

  // Valid until the day before the 10th anniversary. Compute the anniversary first, then step
  // back, so an issue on 1 March expires on 29 February in leap years.
  const expiry = addDays(
    new Date(Date.UTC(issue.getUTCFullYear() + 10, issue.getUTCMonth(), issue.getUTCDate())),
    -1
  );

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
    passportIssueDate: formatAdDate(issue),
    passportExpiryDate: formatAdDate(expiry),
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

/** Two-wheeler categories (A/K) are available from 16; anything including B needs 18. */
export function getMinimumLicenseAge(category: string): number {
  return /\bB\b/.test(category.replace(/^Category\s+/, ''))
    ? MIN_FOUR_WHEELER_LICENSE_AGE
    : MIN_TWO_WHEELER_LICENSE_AGE;
}

/**
 * Generates DoTM Nepal Smart Driving License details (format: 01-06-XXXXXXXX, AD dates).
 * Issued within the last 4 years and on/after the holder became eligible for the category.
 * Valid for 5 years. Returns undefined when the holder is too young for any category.
 */
export function generateDrivingLicenseDetails(
  provinceName?: string,
  dobAD?: string,
  now: Date = new Date()
): DrivingLicenseDetails | undefined {
  const today = todayUtc(now);
  const birth = resolveBirthDate(dobAD, today);
  const latest = addDays(today, -1);

  const eligibleCategories = DRIVING_LICENSE_CATEGORIES.filter(
    (cat) => addYears(birth, getMinimumLicenseAge(cat)).getTime() <= latest.getTime()
  );
  if (eligibleCategories.length === 0) return undefined;

  const drivingLicenseCategory = sample(eligibleCategories);
  const eligibleFrom = addYears(birth, getMinimumLicenseAge(drivingLicenseCategory));
  const earliest = maxDate(eligibleFrom, addYears(today, -4));
  const issue = randomDateBetween(earliest, latest);
  if (!issue) return undefined;

  const provCode = (provinceName && PROVINCE_CODES[provinceName]) || '03';
  const officeCode = randInt(1, 8).toString().padStart(2, '0');
  const serial = randInt(1, 99999999).toString().padStart(8, '0');
  const drivingLicenseNumber = `${provCode}-${officeCode}-${serial}`;

  return {
    drivingLicenseNumber,
    drivingLicenseCategory,
    drivingLicenseIssueDate: formatAdDate(issue),
    drivingLicenseExpiryDate: formatAdDate(addYears(issue, 5)),
  };
}
