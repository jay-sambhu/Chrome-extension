import * as fs from 'fs';
import * as path from 'path';

export interface OccupationEntry {
  title: string;
  department: string;
  companyType: string;
}

export interface CompanyEntry {
  name: string;
  type: string;
}

export interface InstitutionEntry {
  name: string;
  type: 'University' | 'College' | 'School';
  location: string;
}

export type DatasetCategory = 'maleNames' | 'femaleNames' | 'surnames' | 'occupations' | 'companies' | 'institutions';

/**
 * Validates a single name entry (must be PascalCase string without numbers/special symbols).
 */
export function validateNameEntry(name: unknown, existingList: string[]): { valid: boolean; reason?: string } {
  if (typeof name !== 'string') {
    return { valid: false, reason: 'Entry must be a string' };
  }
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 35) {
    return { valid: false, reason: 'Name length must be between 2 and 35 characters' };
  }
  const lowerExisting = new Set(existingList.map((n) => n.toLowerCase().trim()));
  if (lowerExisting.has(trimmed.toLowerCase())) {
    return { valid: false, reason: 'Duplicate: entry already exists in dataset' };
  }
  if (!/^[A-Z][a-zA-Z\s\-]+$/.test(trimmed)) {
    return { valid: false, reason: 'Name must start with a capital letter and contain only letters, spaces, or hyphens' };
  }
  return { valid: true };
}

/**
 * Validates an occupation entry.
 */
export function validateOccupationEntry(
  entry: unknown,
  existingList: OccupationEntry[]
): { valid: boolean; reason?: string } {
  if (!entry || typeof entry !== 'object') {
    return { valid: false, reason: 'Entry must be an object' };
  }
  const obj = entry as Record<string, unknown>;
  if (typeof obj.title !== 'string' || obj.title.trim().length === 0) {
    return { valid: false, reason: 'Missing or invalid title' };
  }
  if (typeof obj.department !== 'string' || obj.department.trim().length === 0) {
    return { valid: false, reason: 'Missing or invalid department' };
  }
  if (typeof obj.companyType !== 'string' || obj.companyType.trim().length === 0) {
    return { valid: false, reason: 'Missing or invalid companyType' };
  }

  const titleLower = obj.title.trim().toLowerCase();
  const duplicate = existingList.some((e) => e.title.trim().toLowerCase() === titleLower);
  if (duplicate) {
    return { valid: false, reason: `Duplicate occupation title: ${obj.title}` };
  }

  return { valid: true };
}

/**
 * Validates a company entry.
 */
export function validateCompanyEntry(
  entry: unknown,
  existingList: CompanyEntry[]
): { valid: boolean; reason?: string } {
  if (!entry || typeof entry !== 'object') {
    return { valid: false, reason: 'Entry must be an object' };
  }
  const obj = entry as Record<string, unknown>;
  if (typeof obj.name !== 'string' || obj.name.trim().length === 0) {
    return { valid: false, reason: 'Missing or invalid company name' };
  }
  if (typeof obj.type !== 'string' || obj.type.trim().length === 0) {
    return { valid: false, reason: 'Missing or invalid company type' };
  }

  const nameLower = obj.name.trim().toLowerCase();
  const duplicate = existingList.some((e) => e.name.trim().toLowerCase() === nameLower);
  if (duplicate) {
    return { valid: false, reason: `Duplicate company name: ${obj.name}` };
  }

  return { valid: true };
}

/**
 * Validates an educational institution entry.
 */
export function validateInstitutionEntry(
  entry: unknown,
  existingList: InstitutionEntry[]
): { valid: boolean; reason?: string } {
  if (!entry || typeof entry !== 'object') {
    return { valid: false, reason: 'Entry must be an object' };
  }
  const obj = entry as Record<string, unknown>;
  if (typeof obj.name !== 'string' || obj.name.trim().length === 0) {
    return { valid: false, reason: 'Missing or invalid institution name' };
  }
  const allowedTypes = ['University', 'College', 'School'];
  if (typeof obj.type !== 'string' || !allowedTypes.includes(obj.type)) {
    return { valid: false, reason: `Invalid type. Allowed: ${allowedTypes.join(', ')}` };
  }
  if (typeof obj.location !== 'string' || obj.location.trim().length === 0) {
    return { valid: false, reason: 'Missing or invalid location' };
  }

  const nameLower = obj.name.trim().toLowerCase();
  const duplicate = existingList.some((e) => e.name.trim().toLowerCase() === nameLower);
  if (duplicate) {
    return { valid: false, reason: `Duplicate institution name: ${obj.name}` };
  }

  return { valid: true };
}

/**
 * Filter and validate candidate items according to category rules.
 */
export function filterValidCandidates<T>(
  category: DatasetCategory,
  candidates: unknown[],
  existingData: any[]
): { valid: T[]; rejected: Array<{ item: unknown; reason: string }> } {
  const valid: T[] = [];
  const rejected: Array<{ item: unknown; reason: string }> = [];

  const currentExisting = [...existingData];

  for (const item of candidates) {
    let check: { valid: boolean; reason?: string };

    switch (category) {
      case 'maleNames':
      case 'femaleNames':
      case 'surnames':
        check = validateNameEntry(item, currentExisting as string[]);
        break;
      case 'occupations':
        check = validateOccupationEntry(item, currentExisting as OccupationEntry[]);
        break;
      case 'companies':
        check = validateCompanyEntry(item, currentExisting as CompanyEntry[]);
        break;
      case 'institutions':
        check = validateInstitutionEntry(item, currentExisting as InstitutionEntry[]);
        break;
      default:
        check = { valid: false, reason: 'Unknown category' };
    }

    if (check.valid) {
      valid.push(item as T);
      currentExisting.push(item);
    } else {
      rejected.push({ item, reason: check.reason || 'Unknown validation failure' });
    }
  }

  return { valid, rejected };
}

/**
 * CLI execution entry point for developer dataset generation.
 */
export async function runDatasetExpansion(): Promise<void> {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const categoryArg = args.find((a) => a.startsWith('--category='))?.split('=')[1] as DatasetCategory | undefined;

  console.log('='.repeat(60));
  console.log('Nepal Test Filler — Administrative Dataset Expansion Utility');
  console.log('='.repeat(60));
  console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'PRODUCTION'}`);
  console.log(`Target Category: ${categoryArg || 'all'}\n`);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey && !isDryRun) {
    console.warn('⚠️  GEMINI_API_KEY is not set in environment.');
    console.log('Pass GEMINI_API_KEY=... or run with --dry-run to test schema validation.');
    return;
  }

  console.log('Validating dataset files and schema constraints...');
  const dataDir = path.resolve(__dirname, '../src/data');
  const files: Record<DatasetCategory, string> = {
    maleNames: path.join(dataDir, 'names/maleNames.json'),
    femaleNames: path.join(dataDir, 'names/femaleNames.json'),
    surnames: path.join(dataDir, 'names/surnames.json'),
    occupations: path.join(dataDir, 'occupations.json'),
    companies: path.join(dataDir, 'companies.json'),
    institutions: path.join(dataDir, 'institutions.json'),
  };

  for (const [cat, filePath] of Object.entries(files)) {
    if (categoryArg && categoryArg !== cat) continue;
    if (fs.existsSync(filePath)) {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      console.log(`✓ ${cat}: ${content.length} existing validated records loaded from ${path.basename(filePath)}`);
    }
  }

  console.log('\nDataset expansion validator is ready.');
}

// Self-execute if run from terminal
if (typeof require !== 'undefined' && require.main === module) {
  runDatasetExpansion().catch(console.error);
}
