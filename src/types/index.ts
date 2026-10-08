export type Gender = 'Male' | 'Female' | 'Other';
export type ProfileType = 'general' | 'student' | 'employee' | 'business' | 'teacher' | 'farmer';

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
  occupation: string;
  jobTitle: string;
  department: string;
  companyName: string;
  username: string;
  password: string;

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
  citizenshipNumber?: string;
  nationalId?: string;
}

export type SupportedFieldType =
  | 'fullName'
  | 'firstName'
  | 'middleName'
  | 'lastName'
  | 'gender'
  | 'dateOfBirth'
  | 'age'
  | 'email'
  | 'phone'
  | 'telephone'
  | 'province'
  | 'district'
  | 'municipality'
  | 'ward'
  | 'tole'
  | 'address'
  | 'occupation'
  | 'jobTitle'
  | 'department'
  | 'companyName'
  | 'username'
  | 'password'
  | 'studentId'
  | 'school'
  | 'guardianName'
  | 'guardianPhone'
  | 'employeeId'
  | 'panNumber'
  | 'vatNumber'
  | 'businessName'
  | 'designation'
  | 'subject'
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
}

export interface FillOptions {
  profile: ProfileType;
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

export type ExtensionMessage =
  | { action: 'SCAN_PAGE' }
  | { action: 'GET_PAGE_FIELDS' }
  | { action: 'FILL_PAGE'; person: SyntheticPerson; options: FillOptions }
  | { action: 'GET_LAST_GENERATED_PERSON' }
  | { action: 'CLASSIFY_FIELD'; payload: FieldClassificationPayload }
  | { action: 'PING' };
