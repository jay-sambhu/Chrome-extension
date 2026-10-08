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

export type ExtensionMessage =
  | { action: 'SCAN_PAGE' }
  | { action: 'FILL_PAGE'; person: SyntheticPerson; options: FillOptions }
  | { action: 'GET_LAST_GENERATED_PERSON' }
  | { action: 'PING' };
