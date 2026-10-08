import { NepalDataEngine, Municipality, Province, District } from './nepalDataEngine';

export interface MunicipalityData {
  name: string;
  type: 'Metropolitan City' | 'Sub-Metropolitan City' | 'Municipality' | 'Rural Municipality';
  maxWards: number;
}

export interface DistrictData {
  name: string;
  municipalities: MunicipalityData[];
}

export interface ProvinceData {
  name: string;
  districts: DistrictData[];
}

// Build hierarchical structure of all 7 provinces and 77 districts
export const NEPAL_GEOGRAPHY: ProvinceData[] = NepalDataEngine.provinces.map((prov: Province) => {
  const provDistricts: District[] = NepalDataEngine.getDistrictsByProvince(prov.name);

  return {
    name: prov.name,
    districts: provDistricts.map((dist: District) => {
      let munis: Municipality[] = NepalDataEngine.getMunicipalitiesByDistrict(dist.name);

      if (munis.length === 0) {
        munis = [
          {
            district: dist.name,
            name: `${dist.name} Municipality`,
            type: 'Municipality',
            maxWards: 12,
          },
          {
            district: dist.name,
            name: `${dist.name} Rural Municipality`,
            type: 'Rural Municipality',
            maxWards: 9,
          },
        ];
      }

      return {
        name: dist.name,
        municipalities: munis.map((m: Municipality) => ({
          name: m.name,
          type: m.type,
          maxWards: m.maxWards,
        })),
      };
    }),
  };
});

export const MALE_FIRST_NAMES = NepalDataEngine.maleNames;
export const FEMALE_FIRST_NAMES = NepalDataEngine.femaleNames;
export const SURNAMES = NepalDataEngine.surnames;

export const OCCUPATIONS = NepalDataEngine.occupations.map((occ) => {
  const company = NepalDataEngine.getRandomCompany(occ.companyType);
  return {
    title: occ.title,
    department: occ.department,
    company: company.name,
  };
});

export const TOLES = NepalDataEngine.toles;
export const PHONE_PREFIXES = NepalDataEngine.telecom.allMobilePrefixes;
export const TEST_EMAIL_DOMAINS = NepalDataEngine.telecom.testEmailDomains;

export { NepalDataEngine };
