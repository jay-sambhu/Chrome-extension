import { FillScript, SyntheticPerson } from '../types';

/**
 * Formats a synthetic persona into a clean, complete payload ready for API testing (Postman, Swagger, cURL).
 * Strips undefined properties while maintaining full Nepali domain attributes.
 */
export function formatPersonaForExport(
  person: SyntheticPerson,
  options: { script?: FillScript; includeMetadata?: boolean } = {}
): Record<string, any> {
  const { includeMetadata = true } = options;

  const base: Record<string, any> = {
    // Identity & Demographics
    fullName: person.fullName,
    honorific: person.honorific,
    firstName: person.firstName,
    middleName: person.middleName,
    lastName: person.lastName,
    gender: person.gender,
    dateOfBirth: person.dateOfBirth,
    dateOfBirthBS: person.dateOfBirthBS,
    age: person.age,
    bloodGroup: person.bloodGroup,

    // Contact & Credentials
    phone: person.phone,
    telephone: person.telephone,
    email: person.email,
    workEmail: person.workEmail,
    username: person.username,
    password: person.password,

    // Addresses
    address: person.address,
    permanentAddress: person.permanentAddress,
    temporaryAddress: person.temporaryAddress,
    currentAddress: person.currentAddress,

    // Official Government Identifiers
    citizenshipNumber: person.citizenshipNumber,
    citizenshipIssueDistrict: person.citizenshipIssueDistrict,
    citizenshipIssueDateBS: person.citizenshipIssueDateBS,
    citizenshipIssuedBy: person.citizenshipIssuedBy,
    nationalId: person.nationalId,
    passportNumber: person.passportNumber,
    passportIssueDate: person.passportIssueDate,
    passportExpiryDate: person.passportExpiryDate,
    passportIssuedBy: person.passportIssuedBy,
    drivingLicenseNumber: person.drivingLicenseNumber,
    drivingLicenseCategory: person.drivingLicenseCategory,
    drivingLicenseIssueDate: person.drivingLicenseIssueDate,
    drivingLicenseExpiryDate: person.drivingLicenseExpiryDate,

    // Archetype Professional & Institutional
    profileType: person.profileType,
    occupation: person.occupation,
    jobTitle: person.jobTitle,
    department: person.department,
    companyName: person.companyName,
    panNumber: person.panNumber,
    salary: person.salary,
    designation: person.designation,

    studentId: person.studentId,
    school: person.school,
    faculty: person.faculty,
    grade: person.grade,
    guardianName: person.guardianName,
    guardianPhone: person.guardianPhone,

    businessName: person.businessName,
    businessType: person.businessType,
    vatNumber: person.vatNumber,
    registeredAddress: person.registeredAddress,

    cropType: person.cropType,
    cooperative: person.cooperative,
    subject: person.subject,

    // Banking & FinTech
    bankName: person.bankName,
    bankBranch: person.bankBranch,
    bankAccountNumber: person.bankAccountNumber,
    bankAccountName: person.bankAccountName,
    esewaId: person.esewaId,
    khaltiId: person.khaltiId,

    // Devanagari localized Unicode
    devanagari: person.devanagari,
  };

  // Strip null and undefined properties for clean JSON
  const cleaned: Record<string, any> = {};
  for (const [key, val] of Object.entries(base)) {
    if (val !== undefined && val !== null) {
      cleaned[key] = val;
    }
  }

  if (includeMetadata) {
    cleaned._source = 'Nepal Test Filler Chrome Extension';
    cleaned._exportedAt = new Date().toISOString();
  }

  return cleaned;
}

/**
 * Serializes a synthetic person into a formatted JSON string for clipboard export.
 */
export function serializePersonaToJson(
  person: SyntheticPerson,
  options: { script?: FillScript; includeMetadata?: boolean; indent?: number } = {}
): string {
  const formatted = formatPersonaForExport(person, options);
  return JSON.stringify(formatted, null, options.indent ?? 2);
}

/**
 * Copies string content to clipboard with fallback for non-standard environments.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback below
    }
  }

  if (typeof document !== 'undefined') {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '-9999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    } catch {
      return false;
    }
  }

  return false;
}
