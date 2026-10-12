import provincesData from '../data/geography/provinces.json';
import districtsData from '../data/geography/districts.json';
import municipalitiesData from '../data/geography/municipalities.json';
import tolesData from '../data/geography/toles.json';
import maleNamesData from '../data/names/maleNames.json';
import femaleNamesData from '../data/names/femaleNames.json';
import surnamesData from '../data/names/surnames.json';
import occupationsData from '../data/occupations.json';
import companiesData from '../data/companies.json';
import institutionsData from '../data/institutions.json';
import telecomData from '../data/telecom.json';

export interface Province {
  id: number;
  name: string;
  nepaliName: string;
  capital: string;
  districtCount: number;
}

export interface District {
  name: string;
  province: string;
  areaCode: string;
  headquarter: string;
}

export type MunicipalityType = 'Metropolitan City' | 'Sub-Metropolitan City' | 'Municipality' | 'Rural Municipality';

export interface Municipality {
  district: string;
  name: string;
  /** Official Devanagari name (e.g. काठमाडौँ महानगरपालिका) */
  nameNp?: string;
  type: MunicipalityType;
  maxWards: number;
}

const MUNICIPALITY_SUFFIX_REGEX = /\s+(Sub-Metropolitan City|Metropolitan City|Rural Municipality|Municipality)$/i;

/**
 * Strips the local-level type suffix: "Butwal Sub-Metropolitan City" -> "Butwal".
 */
export function stripMunicipalitySuffix(name: string): string {
  return name.trim().replace(MUNICIPALITY_SUFFIX_REGEX, '').trim();
}

/**
 * Infers the local-level type from a municipality name suffix (defaults to Municipality).
 */
export function inferMunicipalityType(name: string): MunicipalityType {
  const match = MUNICIPALITY_SUFFIX_REGEX.exec(name.trim());
  if (!match) return 'Municipality';
  const suffix = match[1].toLowerCase();
  if (suffix === 'sub-metropolitan city') return 'Sub-Metropolitan City';
  if (suffix === 'metropolitan city') return 'Metropolitan City';
  if (suffix === 'rural municipality') return 'Rural Municipality';
  return 'Municipality';
}

export interface Occupation {
  title: string;
  department: string;
  companyType: string;
}

export interface Company {
  name: string;
  type: string;
}

export interface Institution {
  name: string;
  type: string;
  location: string;
}

function sample<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export class NepalDataEngine {
  public static readonly provinces: Province[] = provincesData;
  public static readonly districts: District[] = districtsData;
  public static readonly municipalities: Municipality[] = municipalitiesData as Municipality[];
  public static readonly toles: string[] = tolesData;
  public static readonly maleNames: string[] = maleNamesData;
  public static readonly femaleNames: string[] = femaleNamesData;
  public static readonly surnames: string[] = surnamesData;
  public static readonly occupations: Occupation[] = occupationsData;
  public static readonly companies: Company[] = companiesData;
  public static readonly institutions: Institution[] = institutionsData;
  public static readonly telecom = telecomData;

  // Geographic queries
  public static getProvinces(): Province[] {
    return this.provinces;
  }

  public static getDistrictsByProvince(provinceName: string): District[] {
    return this.districts.filter(
      (d) => d.province.toLowerCase() === provinceName.toLowerCase()
    );
  }

  public static getMunicipalitiesByDistrict(districtName: string): Municipality[] {
    return this.municipalities.filter(
      (m) => m.district.toLowerCase() === districtName.toLowerCase()
    );
  }

  public static getAreaCodeForDistrict(districtName: string): string {
    const d = this.districts.find(
      (dist) => dist.name.toLowerCase() === districtName.toLowerCase()
    );
    return d ? d.areaCode : '01';
  }

  // Random generators
  public static getRandomProvince(): Province {
    return sample(this.provinces);
  }

  public static getRandomDistrict(provinceName?: string): District {
    if (provinceName) {
      const filtered = this.getDistrictsByProvince(provinceName);
      if (filtered.length > 0) return sample(filtered);
    }
    return sample(this.districts);
  }

  public static findDistrict(districtName: string): District | undefined {
    const clean = districtName.trim().toLowerCase();
    return this.districts.find((d) => d.name.toLowerCase() === clean);
  }

  /**
   * Finds a real local level by name ("Pokhara", "Pokhara Metropolitan City"), optionally
   * restricted to a district. Matching is case-insensitive and tolerant of a missing type suffix.
   */
  public static findMunicipality(name: string, districtName?: string): Municipality | undefined {
    const clean = name.trim().toLowerCase();
    if (!clean) return undefined;
    const base = stripMunicipalitySuffix(clean).toLowerCase();
    const pool = districtName ? this.getMunicipalitiesByDistrict(districtName) : this.municipalities;
    const exact = pool.find((m) => m.name.toLowerCase() === clean);
    if (exact) return exact;
    const byBase = pool.filter((m) => stripMunicipalitySuffix(m.name).toLowerCase() === base);
    if (byBase.length === 0) return undefined;
    // Prefer the same type when the caller supplied a suffix
    const wantedType = MUNICIPALITY_SUFFIX_REGEX.test(clean) ? inferMunicipalityType(clean) : undefined;
    return byBase.find((m) => m.type === wantedType) || byBase[0];
  }

  /**
   * Returns a real local level of the district. Every one of the 77 districts has entries in
   * municipalities.json, so names are never synthesized. Throws for unknown districts.
   */
  public static getRandomMunicipality(districtName: string, preferredType?: string): Municipality {
    const list = this.getMunicipalitiesByDistrict(districtName);
    if (list.length === 0) {
      throw new Error(`No local levels found for district "${districtName}"`);
    }
    if (preferredType) {
      const matches = list.filter((m) => m.type.toLowerCase() === preferredType.toLowerCase());
      if (matches.length > 0) return sample(matches);
    }
    return sample(list);
  }

  public static getRandomWard(municipality: Municipality): number {
    return randInt(1, municipality.maxWards || 9);
  }

  public static getRandomTole(): string {
    return sample(this.toles);
  }

  public static getRandomMaleName(): string {
    return sample(this.maleNames);
  }

  public static getRandomFemaleName(): string {
    return sample(this.femaleNames);
  }

  public static getRandomSurname(): string {
    return sample(this.surnames);
  }

  public static getRandomOccupation(): Occupation {
    return sample(this.occupations);
  }

  public static getRandomCompany(companyType?: string): Company {
    if (companyType) {
      const match = this.companies.filter((c) => c.type === companyType);
      if (match.length > 0) return sample(match);
    }
    return sample(this.companies);
  }

  /**
   * Picks a realistic employer for an occupation. Education roles are employed by schools,
   * colleges and universities (institutions.json), not by companies.
   */
  public static getEmployerForOccupation(occupation: Occupation): string {
    if (occupation.companyType === 'Education') {
      const title = occupation.title.toLowerCase();
      const type = title.includes('lecturer') ? sample(['College', 'University']) : title.includes('school') || title.includes('teacher') ? 'School' : undefined;
      return this.getRandomInstitution(type).name;
    }
    return this.getRandomCompany(occupation.companyType).name;
  }

  public static getRandomInstitution(type?: string): Institution {
    if (type) {
      const match = this.institutions.filter((i) => i.type === type);
      if (match.length > 0) return sample(match);
    }
    return sample(this.institutions);
  }

  public static getRandomMobilePrefix(): string {
    return sample(this.telecom.allMobilePrefixes);
  }

  public static getRandomTestEmailDomain(): string {
    return sample(this.telecom.testEmailDomains);
  }
}
