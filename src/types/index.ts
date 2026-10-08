export type Gender = 'Male' | 'Female' | 'Other';
export type ProfileType = 'general' | 'student' | 'employee' | 'business' | 'teacher' | 'farmer';
export type FillScript = 'en' | 'np';

export interface DevanagariDetails {
  honorific: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName: string;
  gender: string;
  province: string;
  district: string;
  municipality: string;
  ward: string;
  tole: string;
  fullAddress: string;

  // Permanent Address in Devanagari
  permanentProvince?: string;
  permanentDistrict?: string;
  permanentMunicipality?: string;
  permanentWard?: string;
  permanentTole?: string;
  permanentFullAddress?: string;

  // Temporary / Current Address in Devanagari
  tempProvince?: string;
  tempDistrict?: string;
  tempMunicipality?: string;
  tempWard?: string;
  tempTole?: string;
  tempFullAddress?: string;
  currentProvince?: string;
  currentDistrict?: string;
  currentMunicipality?: string;
  currentWard?: string;
  currentTole?: string;
  currentFullAddress?: string;

  occupation: string;
  jobTitle: string;
  department: string;
  companyName: string;
  designation?: string;
  businessName?: string;
  businessType?: string;
  school?: string;
  grade?: string;
  faculty?: string;
  guardianName?: string;
  cropType?: string;
  cooperative?: string;
  subject?: string;

  // Government & Official Document Identifiers in Devanagari
  citizenshipNumber?: string;
  citizenshipIssueDistrict?: string;
  citizenshipIssueDateBS?: string;
  citizenshipIssuedBy?: string;
  nationalId?: string;
  passportNumber?: string;
  passportIssueDate?: string;
  passportExpiryDate?: string;
  passportIssuedBy?: string;
  drivingLicenseNumber?: string;
  drivingLicenseCategory?: string;
  drivingLicenseIssueDate?: string;
  drivingLicenseExpiryDate?: string;
}

export interface NepalAddress {
  province: string;
  district: string;
  municipality: string;
  municipalityType: 'Metropolitan City' | 'Sub-Metropolitan City' | 'Municipality' | 'Rural Municipality';
  ward: number;
  tole: string;
  fullAddress: string;
}

export interface SyntheticPerson {
  profileType: ProfileType;
  honorific: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName: string;
  gender: Gender;
  dateOfBirth: string; // YYYY-MM-DD
  age: number;
  phone: string;       // 98XXXXXXXX / 97XXXXXXXX
  telephone: string;   // Local area code + XXXXXX
  email: string;       // name.surnameXX@example.test
  address: NepalAddress;
  permanentAddress?: NepalAddress;
  temporaryAddress?: NepalAddress;
  currentAddress?: NepalAddress;
  occupation: string;
  jobTitle: string;
  department: string;
  companyName: string;
  username: string;
  password: string;

  // Devanagari (नेपाली युनिकोड) localized attributes
  devanagari?: DevanagariDetails;

  // Archetype-specific attributes
  studentId?: string;
  school?: string;
  grade?: string;
  guardianName?: string;
  guardianPhone?: string;

  employeeId?: string;
  workEmail?: string;
  panNumber?: string;
  designation?: string;
  salary?: string;

  businessName?: string;
  businessType?: string;
  vatNumber?: string;
  registeredAddress?: string;

  subject?: string;
  faculty?: string;

  cooperative?: string;
  cropType?: string;
  dateOfBirthBS?: string; // e.g. 2058-04-12 (BS)
  citizenshipNumber?: string;
  citizenshipIssueDistrict?: string;
  citizenshipIssueDateBS?: string;
  citizenshipIssuedBy?: string;
  nationalId?: string;
  passportNumber?: string;
  passportIssueDate?: string;
  passportExpiryDate?: string;
  passportIssuedBy?: string;
  drivingLicenseNumber?: string;
  drivingLicenseCategory?: string;
  drivingLicenseIssueDate?: string;
  drivingLicenseExpiryDate?: string;
}

export type SupportedFieldType =
  | 'fullName'
  | 'firstName'
  | 'middleName'
  | 'lastName'
  | 'gender'
  | 'dateOfBirth'
  | 'dateOfBirthBS'
  | 'dateBS'
  | 'bsYear'
  | 'bsMonth'
  | 'bsDay'
  | 'age'
  | 'citizenshipNumber'
  | 'citizenshipIssueDistrict'
  | 'citizenshipIssueDateBS'
  | 'citizenshipIssuedBy'
  | 'nationalId'
  | 'passportNumber'
  | 'passportIssueDate'
  | 'passportExpiryDate'
  | 'passportIssuedBy'
  | 'drivingLicenseNumber'
  | 'drivingLicenseCategory'
  | 'drivingLicenseIssueDate'
  | 'drivingLicenseExpiryDate'
  | 'email'
  | 'phone'
  | 'telephone'
  | 'province'
  | 'permanentProvince'
  | 'temporaryProvince'
  | 'currentProvince'
  | 'district'
  | 'permanentDistrict'
  | 'temporaryDistrict'
  | 'currentDistrict'
  | 'municipality'
  | 'permanentMunicipality'
  | 'temporaryMunicipality'
  | 'currentMunicipality'
  | 'ward'
  | 'permanentWard'
  | 'temporaryWard'
  | 'currentWard'
  | 'tole'
  | 'permanentTole'
  | 'temporaryTole'
  | 'currentTole'
  | 'address'
  | 'permanentAddress'
  | 'temporaryAddress'
  | 'currentAddress'
  | 'sameAsPermanent'
  | 'occupation'
  | 'jobTitle'
  | 'department'
  | 'companyName'
  | 'username'
  | 'password'
  | 'studentId'
  | 'school'
  | 'grade'
  | 'guardianName'
  | 'guardianPhone'
  | 'employeeId'
  | 'panNumber'
  | 'vatNumber'
  | 'salary'
  | 'businessName'
  | 'businessType'
  | 'designation'
  | 'subject'
  | 'faculty'
  | 'cooperative'
  | 'cropType'
  | 'citizenshipNumber'
  | 'nationalId'
  | 'number'
  | 'date'
  | 'text'
  | 'textarea'
  | 'url'
  | 'referenceNumber'
  | 'unknown';

export interface DetectedField {
  element: HTMLElement;
  type: SupportedFieldType;
  confidence: number;
  label?: string;
  name?: string;
  id?: string;
  script?: FillScript;
  addressScope?: 'permanent' | 'temporary';
}

export interface FillOptions {
  profile: ProfileType;
  fillScript?: FillScript;
  script?: FillScript;
  fillCategories: {
    personal: boolean;
    contact: boolean;
    address: boolean;
    professional: boolean;
  };
  enableAiClassification?: boolean;
}

export interface FillResult {
  success: boolean;
  fieldsFilledCount: number;
  details: Array<{
    field: string;
    type: SupportedFieldType;
    value: string | boolean;
  }>;
  errors?: string[];
}

export interface GeminiConfig {
  apiKey: string;
  enabled: boolean;
  model?: string;
}

export interface FieldClassificationPayload {
  domain: string;
  name?: string;
  id?: string;
  placeholder?: string;
  label?: string;
  type?: string;
}

export interface ClassificationResult {
  fieldType: SupportedFieldType;
  confidence: number;
  reasoning?: string;
  fromCache?: boolean;
}

export interface ClassificationCacheEntry {
  fieldType: SupportedFieldType;
  confidence: number;
  reasoning?: string;
  timestamp: number;
}

export interface PageFieldInspection {
  index: number;
  name?: string;
  id?: string;
  placeholder?: string;
  label?: string;
  type: string;
  detectedType: SupportedFieldType;
  confidence: number;
  source: 'domain_override' | 'heuristic' | 'ai_cached' | 'unmapped';
}

export interface ExtensionSettings {
  defaultProfile: ProfileType;
  autoFillOnLoad: boolean;
  enableAiClassification: boolean;
  theme: 'dark' | 'light' | 'system';
}

export type ExtensionMessage =
  | { action: 'SCAN_PAGE' }
  | { action: 'GET_PAGE_FIELDS' }
  | { action: 'FILL_PAGE'; person: SyntheticPerson; options: FillOptions }
  | { action: 'GET_LAST_GENERATED_PERSON' }
  | { action: 'CLASSIFY_FIELD'; payload: FieldClassificationPayload }
  | { action: 'PING' };

