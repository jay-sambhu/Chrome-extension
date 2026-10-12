// Kept dependency-free: the content script imports this to match bank <select> options.

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
