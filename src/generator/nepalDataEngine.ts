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

export interface Municipality {
  district: string;
  name: string;
  type: 'Metropolitan City' | 'Sub-Metropolitan City' | 'Municipality' | 'Rural Municipality';
  maxWards: number;
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

  public static getRandomMunicipality(districtName: string, preferredType?: string): Municipality {
    const list = this.getMunicipalitiesByDistrict(districtName);
    if (list.length > 0) {
      if (preferredType) {
        const matches = list.filter((m) => m.type.toLowerCase() === preferredType.toLowerCase());
        if (matches.length > 0) return sample(matches);
      }
      return sample(list);
    }
    // Fallback if rural district not individually listed
    return {
      district: districtName,
      name: `${districtName} ${preferredType || 'Municipality'}`,
      type: (preferredType as any) || 'Municipality',
      maxWards: 9,
    };
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
