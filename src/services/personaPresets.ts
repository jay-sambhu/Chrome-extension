import {
  PersonaPreset,
  ProfileType,
  SyntheticPerson,
  Gender,
} from '../types';

export type { PersonaPreset };
import {
  generateSyntheticPerson,
  generateNepalAddress,
  generateNepaliTelephone,
} from '../generator/personGenerator';
import { generateDevanagariDetails } from '../generator/devanagariEngine';

export const BUILTIN_PERSONA_PRESETS: PersonaPreset[] = [
  {
    id: 'qa-superadmin',
    name: 'QA SuperAdmin',
    description: 'High-privilege system administrator persona for RBAC & enterprise test suites',
    baseProfile: 'employee',
    gender: 'Random',
    preferredScript: 'en',
    designation: 'QA Super Administrator',
    department: 'Quality Assurance & Security',
    companyName: 'Nepal Enterprise QA Cloud',
    emailDomain: 'superadmin.qa',
    bloodGroup: 'O+',
    bankName: 'Nabil Bank',
    province: 'Bagmati Province',
    district: 'Kathmandu',
    municipality: 'Kathmandu Metropolitan City',
    isBuiltin: true,
    createdAt: 1710000000000,
    updatedAt: 1710000000000,
  },
  {
    id: 'biratnagar-retailer',
    name: 'Biratnagar Retailer',
    description: 'Commercial merchant and business operator in Eastern Nepal (Koshi Province)',
    baseProfile: 'business',
    gender: 'Random',
    preferredScript: 'en',
    businessName: 'Birat Trade Syndicate',
    businessType: 'Retail & FMCG Distribution',
    designation: 'Managing Director',
    province: 'Koshi Province',
    district: 'Morang',
    municipality: 'Biratnagar Metropolitan City',
    bankName: 'Global IME Bank',
    isBuiltin: true,
    createdAt: 1710000000000,
    updatedAt: 1710000000000,
  },
  {
    id: 'pokhara-foreign-student',
    name: 'Pokhara Foreign Student',
    description: 'University student enrolled in higher education in Western Nepal (Gandaki Province)',
    baseProfile: 'student',
    gender: 'Random',
    preferredScript: 'en',
    school: 'Prithvi Narayan Campus',
    faculty: 'Science & Information Technology',
    grade: 'Bachelor 3rd Year',
    province: 'Gandaki Province',
    district: 'Kaski',
    municipality: 'Pokhara Metropolitan City',
    isBuiltin: true,
    createdAt: 1710000000000,
    updatedAt: 1710000000000,
  },
];

let memoryPresets: PersonaPreset[] | null = null;

/**
 * Retrieves all available persona presets, merging built-in presets if absent.
 */
export async function getPersonaPresets(): Promise<PersonaPreset[]> {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    try {
      const data = await chrome.storage.local.get(['personaPresets']);
      const stored = data.personaPresets as PersonaPreset[] | undefined;
      if (Array.isArray(stored) && stored.length > 0) {
        // Ensure built-in presets exist if not intentionally deleted
        const existingIds = new Set(stored.map((p) => p.id));
        const missingBuiltins = BUILTIN_PERSONA_PRESETS.filter((b) => !existingIds.has(b.id));
        const merged = [...stored, ...missingBuiltins];
        memoryPresets = merged;
        return merged;
      }
      // Initialize with built-ins if empty
      await chrome.storage.local.set({ personaPresets: BUILTIN_PERSONA_PRESETS });
      memoryPresets = [...BUILTIN_PERSONA_PRESETS];
      return BUILTIN_PERSONA_PRESETS;
    } catch {
      // Fallback
    }
  }

  if (!memoryPresets) {
    memoryPresets = [...BUILTIN_PERSONA_PRESETS];
  }
  return memoryPresets;
}

/**
 * Retrieves a single persona preset by ID.
 */
export async function getPersonaPresetById(id: string): Promise<PersonaPreset | undefined> {
  const presets = await getPersonaPresets();
  return presets.find((p) => p.id === id);
}

/**
 * Saves or updates a persona preset in storage.
 */
export async function savePersonaPreset(
  preset: Partial<PersonaPreset> & { name: string; baseProfile: ProfileType }
): Promise<PersonaPreset> {
  const existingPresets = await getPersonaPresets();
  const now = Date.now();

  let targetId = preset.id;
  if (!targetId || targetId.trim() === '') {
    targetId = `preset_${now}_${Math.random().toString(36).slice(2, 7)}`;
  }

  const existingIndex = existingPresets.findIndex((p) => p.id === targetId);

  const newPreset: PersonaPreset = {
    ...(existingIndex >= 0 ? existingPresets[existingIndex] : {}),
    ...preset,
    id: targetId,
    name: preset.name.trim(),
    baseProfile: preset.baseProfile,
    isBuiltin: existingIndex >= 0 ? Boolean(existingPresets[existingIndex].isBuiltin) : false,
    createdAt: existingIndex >= 0 ? existingPresets[existingIndex].createdAt : now,
    updatedAt: now,
  };

  let updatedList: PersonaPreset[];
  if (existingIndex >= 0) {
    updatedList = [...existingPresets];
    updatedList[existingIndex] = newPreset;
  } else {
    updatedList = [...existingPresets, newPreset];
  }

  memoryPresets = updatedList;

  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    await chrome.storage.local.set({ personaPresets: updatedList });
  }

  return newPreset;
}

/**
 * Deletes a persona preset by ID. Built-in presets cannot be deleted.
 */
export async function deletePersonaPreset(id: string): Promise<boolean> {
  const presets = await getPersonaPresets();
  const target = presets.find((p) => p.id === id);

  if (!target || target.isBuiltin) {
    return false;
  }

  const updatedList = presets.filter((p) => p.id !== id);
  memoryPresets = updatedList;

  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    await chrome.storage.local.set({ personaPresets: updatedList });
  }

  return true;
}

/**
 * Resets persona presets back to the initial built-in defaults.
 */
export async function resetDefaultPresets(): Promise<PersonaPreset[]> {
  memoryPresets = [...BUILTIN_PERSONA_PRESETS];
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    await chrome.storage.local.set({ personaPresets: BUILTIN_PERSONA_PRESETS });
  }
  return BUILTIN_PERSONA_PRESETS;
}

/**
 * Generates a realistic SyntheticPerson adhering to the constraints of a custom PersonaPreset.
 */
export function generatePersonFromPreset(preset: PersonaPreset): SyntheticPerson {
  const forcedGender: Gender | undefined =
    preset.gender === 'Male' || preset.gender === 'Female' || preset.gender === 'Other'
      ? preset.gender
      : undefined;

  const person = generateSyntheticPerson(preset.baseProfile, forcedGender);

  // Geographic constraints
  if (preset.province || preset.district) {
    const customAddress = generateNepalAddress(
      preset.province,
      preset.baseProfile === 'farmer',
      preset.district
    );

    if (preset.municipality && preset.municipality.trim()) {
      customAddress.municipality = preset.municipality.trim();
      const cleanMuni = customAddress.municipality
        .replace(' Metropolitan City', '')
        .replace(' Sub-Metropolitan City', '')
        .replace(' Rural Municipality', '')
        .replace(' Municipality', '');
      customAddress.fullAddress = `${customAddress.tole}, Ward-${customAddress.ward}, ${cleanMuni}, ${customAddress.district}, ${customAddress.province}`;
    }

    person.address = customAddress;
    person.telephone = generateNepaliTelephone(customAddress.district);
    person.citizenshipIssueDistrict = customAddress.district;
  }

  // Institutional and Professional Overrides
  if (preset.companyName) person.companyName = preset.companyName;
  if (preset.department) person.department = preset.department;
  if (preset.designation) {
    person.designation = preset.designation;
    person.jobTitle = preset.designation;
  }
  if (preset.occupation) person.occupation = preset.occupation;
  if (preset.jobTitle) person.jobTitle = preset.jobTitle;

  if (preset.school) person.school = preset.school;
  if (preset.faculty) person.faculty = preset.faculty;
  if (preset.grade) person.grade = preset.grade;

  if (preset.businessName) person.businessName = preset.businessName;
  if (preset.businessType) person.businessType = preset.businessType;

  if (preset.cropType) person.cropType = preset.cropType;
  if (preset.cooperative) person.cooperative = preset.cooperative;

  if (preset.bloodGroup) person.bloodGroup = preset.bloodGroup;
  if (preset.bankName) {
    person.bankName = preset.bankName;
    if (person.bankAccountName) person.bankAccountName = person.fullName;
  }

  if (preset.panNumber) person.panNumber = preset.panNumber;
  if (preset.vatNumber) person.vatNumber = preset.vatNumber;

  if (preset.emailDomain) {
    const cleanDomain = preset.emailDomain.replace(/^@/, '').trim();
    const prefix = person.email.split('@')[0];
    person.email = `${prefix}@${cleanDomain}`;
    if (person.workEmail) person.workEmail = `${prefix}@${cleanDomain}`;
  }

  // Synchronize Devanagari Unicode attributes
  person.devanagari = generateDevanagariDetails(person);

  return person;
}
