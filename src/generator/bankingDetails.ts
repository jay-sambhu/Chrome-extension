import { DISTRICTS_DEVANAGARI } from './devanagariEngine';
import { COMMERCIAL_BANKS, CommercialBank } from './banks';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sample<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export { COMMERCIAL_BANKS } from './banks';
export type { CommercialBank } from './banks';

/**
 * Resolves a bank by its full name ("Nabil Bank Limited"), short name ("Nabil Bank", "NIMB")
 * or SWIFT code, case-insensitively. Returns undefined for unknown banks.
 */
export function findCommercialBank(name: string): CommercialBank | undefined {
  const clean = name.trim().toLowerCase().replace(/\s+/g, ' ');
  if (!clean) return undefined;
  const withoutLtd = clean.replace(/\s+(limited|ltd\.?)$/, '');
  return COMMERCIAL_BANKS.find((b) => {
    const full = b.nameEn.toLowerCase();
    return (
      full === clean ||
      b.shortName.toLowerCase() === clean ||
      b.shortName.toLowerCase() === withoutLtd ||
      full.replace(/\s+limited$/, '') === withoutLtd ||
      b.swiftCode.toLowerCase() === clean
    );
  });
}

const VALLEY_BRANCHES = [
  { en: 'Putalisadak Branch', np: 'पुतलीसडक शाखा' },
  { en: 'New Road Branch', np: 'न्यु रोड शाखा' },
  { en: 'Pulchowk Branch', np: 'पुलचोक शाखा' },
  { en: 'Thamel Branch', np: 'ठमेल शाखा' },
  { en: 'Baneshwor Branch', np: 'बानेश्वर शाखा' },
  { en: 'Kumaripati Branch', np: 'कुमारीपाटी शाखा' },
  { en: 'Durbarmarg Branch', np: 'दरबारमार्ग शाखा' },
  { en: 'Koteshwor Branch', np: 'कोटेश्वर शाखा' },
  { en: 'Maharajgunj Branch', np: 'महाराजगञ्ज शाखा' },
];

const DISTRICT_BRANCHES: Record<string, Array<{ en: string; np: string }>> = {
  Kaski: [
    { en: 'Lakeside Branch, Pokhara', np: 'लेकसाइड शाखा, पोखरा' },
    { en: 'New Road Branch, Pokhara', np: 'न्यु रोड शाखा, पोखरा' },
    { en: 'Mahendrapool Branch, Pokhara', np: 'महेन्द्रपूल शाखा, पोखरा' },
  ],
  Morang: [
    { en: 'Main Road Branch, Biratnagar', np: 'मेन रोड शाखा, विराटनगर' },
    { en: 'Traffic Chowk Branch, Biratnagar', np: 'ट्राफिक चोक शाखा, विराटनगर' },
  ],
  Chitwan: [
    { en: 'Narayangarh Branch, Chitwan', np: 'नारायणगढ शाखा, चितवन' },
    { en: 'Bharatpur Branch, Chitwan', np: 'भरतपुर शाखा, चितवन' },
  ],
  Rupandehi: [
    { en: 'Traffic Chowk Branch, Butwal', np: 'ट्राफिक चोक शाखा, बुटवल' },
    { en: 'Milanchowk Branch, Butwal', np: 'मिलनचोक शाखा, बुटवल' },
    { en: 'Bhairahawa Branch', np: 'भैरहवा शाखा' },
  ],
};

/**
 * Generates a realistic bank branch coupled with district if provided.
 */
export function generateBankBranch(district?: string): { en: string; np: string } {
  if (!district || district === 'Kathmandu' || district === 'Lalitpur' || district === 'Bhaktapur') {
    return sample(VALLEY_BRANCHES);
  }

  const districtBranches = DISTRICT_BRANCHES[district];
  if (districtBranches) {
    return sample(districtBranches);
  }

  const npDistrict = DISTRICTS_DEVANAGARI[district] || district;
  return {
    en: `${district} Branch`,
    np: `${npDistrict} शाखा`,
  };
}

/**
 * Returns the Devanagari form of a branch produced by {@link generateBankBranch}
 * (e.g. "Lakeside Branch, Pokhara" -> "लेकसाइड शाखा, पोखरा"), or undefined if unknown.
 */
export function translateBankBranch(branchEn: string): string | undefined {
  const all = [...VALLEY_BRANCHES, ...Object.values(DISTRICT_BRANCHES).flat()];
  const known = all.find((b) => b.en === branchEn);
  if (known) return known.np;
  const match = /^(.+) Branch$/.exec(branchEn.trim());
  if (match && DISTRICTS_DEVANAGARI[match[1]]) {
    return `${DISTRICTS_DEVANAGARI[match[1]]} शाखा`;
  }
  return undefined;
}

/**
 * Generates a 14 to 16-digit synthetic bank account number.
 */
export function generateBankAccountNumber(length = 16): string {
  const digits: string[] = [];
  // First digit non-zero
  digits.push(randInt(1, 9).toString());
  for (let i = 1; i < length; i++) {
    digits.push(randInt(0, 9).toString());
  }
  return digits.join('');
}

export interface BankingDetails {
  bankName: string;
  bankBranch: string;
  bankAccountNumber: string;
  bankAccountName: string;
  esewaId: string;
  khaltiId: string;
  bankNameNp: string;
  bankBranchNp: string;
  bankAccountNumberNp: string;
  bankAccountNameNp: string;
}

/**
 * Generates consistent Commercial Bank, account, and digital wallet details.
 */
export function generateBankingDetails(
  fullNameEn: string,
  fullNameNp: string,
  district?: string,
  phone?: string,
  preferredBank?: string
): BankingDetails {
  const bank = (preferredBank && findCommercialBank(preferredBank)) || sample(COMMERCIAL_BANKS);
  const branch = generateBankBranch(district);
  const bankAccountNumber = generateBankAccountNumber(bank.accountLength);

  // Digital Wallets in Nepal correspond to the 10-digit mobile phone number (98XXXXXXXX / 97XXXXXXXX)
  const defaultPhone = phone || `98${randInt(10000000, 99999999)}`;
  const esewaId = defaultPhone;
  const khaltiId = defaultPhone;

  return {
    bankName: bank.nameEn,
    bankBranch: branch.en,
    bankAccountNumber,
    bankAccountName: fullNameEn,
    esewaId,
    khaltiId,
    bankNameNp: bank.nameNp,
    bankBranchNp: branch.np,
    bankAccountNumberNp: bankAccountNumber,
    bankAccountNameNp: fullNameNp,
  };
}
