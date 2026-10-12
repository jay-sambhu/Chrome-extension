import { describe, it, expect } from 'vitest';
import { NepalDataEngine } from '../src/generator/nepalDataEngine';

const MALE_FIRST_NAMES = NepalDataEngine.maleNames;
const FEMALE_FIRST_NAMES = NepalDataEngine.femaleNames;
const SURNAMES = NepalDataEngine.surnames;

describe('Phase 2 — Nepal Data Engine', () => {
  it('contains all 7 official provinces of Nepal', () => {
    const provinces = NepalDataEngine.getProvinces();
    expect(provinces.length).toBe(7);

    const expectedProvinces = [
      'Koshi Province',
      'Madhesh Province',
      'Bagmati Province',
      'Gandaki Province',
      'Lumbini Province',
      'Karnali Province',
      'Sudurpashchim Province',
    ];

    expectedProvinces.forEach((name) => {
      const p = provinces.find((prov) => prov.name === name);
      expect(p).toBeDefined();
      expect(p!.nepaliName).toBeTruthy();
      expect(p!.capital).toBeTruthy();
    });
  });

  it('contains all 77 official districts of Nepal mapped to valid provinces', () => {
    const districts = NepalDataEngine.districts;
    expect(districts.length).toBe(77);

    const provinces = NepalDataEngine.getProvinces().map((p) => p.name);

    districts.forEach((dist) => {
      expect(dist.name).toBeTruthy();
      expect(provinces).toContain(dist.province);
      expect(dist.areaCode).toMatch(/^\d{2,3}$/);
      expect(dist.headquarter).toBeTruthy();
    });
  });

  it('contains all 6 Metropolitan Cities', () => {
    const metroCities = NepalDataEngine.municipalities.filter(
      (m) => m.type === 'Metropolitan City'
    );
    expect(metroCities.length).toBe(6);

    const names = metroCities.map((m) => m.name);
    expect(names).toContain('Kathmandu Metropolitan City');
    expect(names).toContain('Lalitpur Metropolitan City');
    expect(names).toContain('Bharatpur Metropolitan City');
    expect(names).toContain('Pokhara Metropolitan City');
    expect(names).toContain('Biratnagar Metropolitan City');
    expect(names).toContain('Birgunj Metropolitan City');
  });

  it('contains all 11 Sub-Metropolitan Cities', () => {
    const subMetros = NepalDataEngine.municipalities.filter(
      (m) => m.type === 'Sub-Metropolitan City'
    );
    expect(subMetros.length).toBe(11);

    const names = subMetros.map((m) => m.name);
    expect(names).toContain('Janakpurdham Sub-Metropolitan City');
    expect(names).toContain('Dharan Sub-Metropolitan City');
    expect(names).toContain('Itahari Sub-Metropolitan City');
    expect(names).toContain('Butwal Sub-Metropolitan City');
    expect(names).toContain('Ghorahi Sub-Metropolitan City');
    expect(names).toContain('Tulsipur Sub-Metropolitan City');
    expect(names).toContain('Nepalgunj Sub-Metropolitan City');
    expect(names).toContain('Hetauda Sub-Metropolitan City');
    expect(names).toContain('Dhangadhi Sub-Metropolitan City');
    expect(names).toContain('Kalaiya Sub-Metropolitan City');
    expect(names).toContain('Jitpursimara Sub-Metropolitan City');
  });

  it('contains 200+ male names and 200+ female names', () => {
    expect(MALE_FIRST_NAMES.length).toBeGreaterThanOrEqual(200);
    expect(FEMALE_FIRST_NAMES.length).toBeGreaterThanOrEqual(200);
    // Unique names verification
    const uniqueMale = new Set(MALE_FIRST_NAMES);
    const uniqueFemale = new Set(FEMALE_FIRST_NAMES);
    expect(uniqueMale.size).toBeGreaterThanOrEqual(180);
    expect(uniqueFemale.size).toBeGreaterThanOrEqual(180);
  });

  it('contains 150+ authentic Nepali surnames across ethnic groups', () => {
    expect(SURNAMES.length).toBeGreaterThanOrEqual(150);

    // Checks key ethnicities representation
    expect(SURNAMES).toContain('Adhikari'); // Brahmin/Chhetri
    expect(SURNAMES).toContain('Shrestha'); // Newar
    expect(SURNAMES).toContain('Gurung');   // Gurung
    expect(SURNAMES).toContain('Magar');    // Magar
    expect(SURNAMES).toContain('Rai');      // Kirat
    expect(SURNAMES).toContain('Chaudhary'); // Tharu
    expect(SURNAMES).toContain('Yadav');    // Madhesi
    expect(SURNAMES).toContain('Tamang');   // Tamang
  });

  it('lists real local levels (with Devanagari names) for every one of the 77 districts', () => {
    let totalDistricts = 0;
    NepalDataEngine.getProvinces().forEach((prov) => {
      const districts = NepalDataEngine.getDistrictsByProvince(prov.name);
      totalDistricts += districts.length;
      districts.forEach((dist) => {
        const munis = NepalDataEngine.getMunicipalitiesByDistrict(dist.name);
        expect(munis.length).toBeGreaterThan(0);
        munis.forEach((m) => {
          expect(m.name).toBeTruthy();
          expect(m.maxWards).toBeGreaterThanOrEqual(5);
          expect(m.maxWards).toBeLessThanOrEqual(33);
          expect(m.nameNp).toMatch(/^[\u0900-\u097F\s.\-]+$/);
          expect(m.name.endsWith(m.type)).toBe(true);
        });
      });
    });

    expect(totalDistricts).toBe(77);
  });

  it('matches the official count of 753 local levels by type', () => {
    const count = (type: string) => NepalDataEngine.municipalities.filter((m) => m.type === type).length;
    expect(NepalDataEngine.municipalities.length).toBe(753);
    expect(count('Metropolitan City')).toBe(6);
    expect(count('Sub-Metropolitan City')).toBe(11);
    expect(count('Municipality')).toBe(276);
    expect(count('Rural Municipality')).toBe(460);

    const keys = NepalDataEngine.municipalities.map((m) => `${m.district}|${m.name}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('never synthesizes municipality names', () => {
    expect(() => NepalDataEngine.getRandomMunicipality('Atlantis')).toThrow();
    for (const dist of NepalDataEngine.districts) {
      const muni = NepalDataEngine.getRandomMunicipality(dist.name, 'Rural Municipality');
      expect(NepalDataEngine.municipalities).toContain(muni);
    }
  });

  it('finds local levels by full or short name', () => {
    expect(NepalDataEngine.findMunicipality('Pokhara')?.name).toBe('Pokhara Metropolitan City');
    expect(NepalDataEngine.findMunicipality('biratnagar metropolitan city')?.district).toBe('Morang');
    expect(NepalDataEngine.findMunicipality('Madi', 'Chitwan')?.type).toBe('Municipality');
    expect(NepalDataEngine.findMunicipality('Madi', 'Kaski')?.type).toBe('Rural Municipality');
    expect(NepalDataEngine.findMunicipality('Nowhere')).toBeUndefined();
  });

  it('employs education occupations at schools, colleges or universities', () => {
    const education = NepalDataEngine.occupations.filter((o) => o.companyType === 'Education');
    const institutionNames = NepalDataEngine.institutions.map((i) => i.name);
    education.forEach((occ) => {
      for (let i = 0; i < 10; i++) {
        expect(institutionNames).toContain(NepalDataEngine.getEmployerForOccupation(occ));
      }
    });
  });

  it('has no duplicate toles', () => {
    expect(new Set(NepalDataEngine.toles).size).toBe(NepalDataEngine.toles.length);
  });

  it('returns valid random samples from NepalDataEngine helper queries', () => {
    const prov = NepalDataEngine.getRandomProvince();
    expect(prov.name).toBeTruthy();

    const dist = NepalDataEngine.getRandomDistrict(prov.name);
    expect(dist.province).toBe(prov.name);

    const muni = NepalDataEngine.getRandomMunicipality(dist.name);
    expect(muni.name).toBeTruthy();

    const ward = NepalDataEngine.getRandomWard(muni);
    expect(ward).toBeGreaterThanOrEqual(1);
    expect(ward).toBeLessThanOrEqual(muni.maxWards);

    const tole = NepalDataEngine.getRandomTole();
    expect(tole).toBeTruthy();

    const occ = NepalDataEngine.getRandomOccupation();
    expect(occ.title).toBeTruthy();
    expect(occ.department).toBeTruthy();

    const comp = NepalDataEngine.getRandomCompany(occ.companyType);
    expect(comp.name).toBeTruthy();

    const inst = NepalDataEngine.getRandomInstitution();
    expect(inst.name).toBeTruthy();

    const areaCode = NepalDataEngine.getAreaCodeForDistrict('Kathmandu');
    expect(areaCode).toBe('01');
  });
});
