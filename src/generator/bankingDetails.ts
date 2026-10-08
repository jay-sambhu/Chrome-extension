import { DISTRICTS_DEVANAGARI } from './devanagariEngine';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sample<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export interface CommercialBank {
  nameEn: string;
  nameNp: string;
  shortName: string;
  swiftCode: string;
  accountLength: number;
}

/**
 * Authentic list of "Class A" Commercial Banks licensed by Nepal Rastra Bank (NRB).
 */
export const COMMERCIAL_BANKS: CommercialBank[] = [
  {
    nameEn: 'Nabil Bank Limited',
    nameNp: 'नबिल बैंक लिमिटेड',
    shortName: 'Nabil Bank',
    swiftCode: 'NARBNPKA',
    accountLength: 14,
  },
  {
    nameEn: 'NIC Asia Bank Limited',
    nameNp: 'एनआईसी एशिया बैंक लिमिटेड',
    shortName: 'NIC Asia Bank',
    swiftCode: 'NICANPKA',
    accountLength: 16,
  },
  {
    nameEn: 'Global IME Bank Limited',
    nameNp: 'ग्लोबल आइएमई बैंक लिमिटेड',
    shortName: 'Global IME Bank',
    swiftCode: 'GLBBNPKA',
    accountLength: 15,
  },
  {
    nameEn: 'Rastriya Banijya Bank Limited',
    nameNp: 'राष्ट्रिय वाणिज्य बैंक लिमिटेड',
    shortName: 'Rastriya Banijya Bank',
    swiftCode: 'RBBANPKA',
    accountLength: 16,
  },
  {
    nameEn: 'Nepal Investment Mega Bank Limited',
    nameNp: 'नेपाल इन्भेष्टमेण्ट मेगा बैंक लिमिटेड',
    shortName: 'NIMB',
    swiftCode: 'NIBLNPKT',
    accountLength: 14,
  },
  {
    nameEn: 'Himalayan Bank Limited',
    nameNp: 'हिमालयन बैंक लिमिटेड',
    shortName: 'Himalayan Bank',
    swiftCode: 'HIMANPKA',
    accountLength: 14,
  },
  {
    nameEn: 'Sanima Bank Limited',
    nameNp: 'सानिमा बैंक लिमिटेड',
    shortName: 'Sanima Bank',
    swiftCode: 'SANINPKA',
    accountLength: 16,
  },
  {
    nameEn: 'Siddhartha Bank Limited',
    nameNp: 'सिद्धार्थ बैंक लिमिटेड',
    shortName: 'Siddhartha Bank',
    swiftCode: 'SBLBNPKA',
    accountLength: 16,
  },
  {
    nameEn: 'Prabhu Bank Limited',
    nameNp: 'प्रभु बैंक लिमिटेड',
    shortName: 'Prabhu Bank',
    swiftCode: 'PRABNPKA',
    accountLength: 16,
  },
  {
    nameEn: 'Laxmi Sunrise Bank Limited',
    nameNp: 'लक्ष्मी सनराइज बैंक लिमिटेड',
    shortName: 'Laxmi Sunrise Bank',
    swiftCode: 'LXBLNPKA',
    accountLength: 16,
  },
  {
    nameEn: 'Everest Bank Limited',
    nameNp: 'एभरेष्ट बैंक लिमिटेड',
    shortName: 'Everest Bank',
    swiftCode: 'EVBLNPKA',
    accountLength: 14,
  },
  {
    nameEn: 'Nepal Bank Limited',
    nameNp: 'नेपाल बैंक लिमिटेड',
    shortName: 'Nepal Bank',
    swiftCode: 'NEBLNPKA',
    accountLength: 16,
  },
  {
    nameEn: 'Prime Commercial Bank Limited',
    nameNp: 'प्राइम कमर्सियल बैंक लिमिटेड',
    shortName: 'Prime Commercial Bank',
    swiftCode: 'PCBLNPKA',
    accountLength: 15,
  },
  {
    nameEn: 'Kumari Bank Limited',
    nameNp: 'कुमारी बैंक लिमिटेड',
    shortName: 'Kumari Bank',
    swiftCode: 'KMBLNPKA',
    accountLength: 16,
  },
  {
    nameEn: 'Citizens Bank International Limited',
    nameNp: 'सिटिजन्स बैंक इन्टरनेसनल लिमिटेड',
    shortName: 'Citizens Bank',
    swiftCode: 'CTZNNPKA',
    accountLength: 16,
  },
  {
    nameEn: 'Machhapuchchhre Bank Limited',
    nameNp: 'माछापुच्छ्रे बैंक लिमिटेड',
    shortName: 'Machhapuchchhre Bank',
    swiftCode: 'MBLBNPKA',
    accountLength: 16,
  },
  {
    nameEn: 'NMB Bank Limited',
    nameNp: 'एनएमबि बैंक लिमिटेड',
    shortName: 'NMB Bank',
    swiftCode: 'NMBLNPKA',
    accountLength: 16,
  },
  {
    nameEn: 'Standard Chartered Bank Nepal Limited',
    nameNp: 'स्ट्यान्डर्ड चार्टर्ड बैंक नेपाल लिमिटेड',
    shortName: 'Standard Chartered Bank',
    swiftCode: 'SCBLNPKA',
    accountLength: 14,
  },
  {
    nameEn: 'Agricultural Development Bank Limited',
    nameNp: 'कृषि विकास बैंक लिमिटेड',
    shortName: 'ADBL',
    swiftCode: 'ADBLNPKA',
    accountLength: 16,
  },
  {
    nameEn: 'Nepal SBI Bank Limited',
    nameNp: 'नेपाल एसबिआई बैंक लिमिटेड',
    shortName: 'Nepal SBI Bank',
    swiftCode: 'NSBINPKA',
    accountLength: 16,
  },
];

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

/**
 * Generates a realistic bank branch coupled with district if provided.
 */
export function generateBankBranch(district?: string): { en: string; np: string } {
  if (!district || district === 'Kathmandu' || district === 'Lalitpur' || district === 'Bhaktapur') {
    return sample(VALLEY_BRANCHES);
  }

  if (district === 'Kaski') {
    const kaskiBranches = [
      { en: 'Lakeside Branch, Pokhara', np: 'लेकसाइड शाखा, पोखरा' },
      { en: 'New Road Branch, Pokhara', np: 'न्यु रोड शाखा, पोखरा' },
      { en: 'Mahendrapool Branch, Pokhara', np: 'महेन्द्रपूल शाखा, पोखरा' },
    ];
    return sample(kaskiBranches);
  }

  if (district === 'Morang') {
    const morangBranches = [
      { en: 'Main Road Branch, Biratnagar', np: 'मेन रोड शाखा, विराटनगर' },
      { en: 'Traffic Chowk Branch, Biratnagar', np: 'ट्राफिक चोक शाखा, विराटनगर' },
    ];
    return sample(morangBranches);
  }

  if (district === 'Chitwan') {
    const chitwanBranches = [
      { en: 'Narayangarh Branch, Chitwan', np: 'नारायणगढ शाखा, चितवन' },
      { en: 'Bharatpur Branch, Chitwan', np: 'भरतपुर शाखा, चितवन' },
    ];
    return sample(chitwanBranches);
  }

  if (district === 'Rupandehi') {
    const rupandehiBranches = [
      { en: 'Traffic Chowk Branch, Butwal', np: 'ट्राफिक चोक शाखा, बुटवल' },
      { en: 'Milanchowk Branch, Butwal', np: 'मिलनचोक शाखा, बुटवल' },
      { en: 'Bhairahawa Branch', np: 'भैरहवा शाखा' },
    ];
    return sample(rupandehiBranches);
  }

  const npDistrict = DISTRICTS_DEVANAGARI[district] || district;
  return {
    en: `${district} Branch`,
    np: `${npDistrict} शाखा`,
  };
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
  phone?: string
): BankingDetails {
  const bank = sample(COMMERCIAL_BANKS);
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
