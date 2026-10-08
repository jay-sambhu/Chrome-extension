import { describe, it, expect } from 'vitest';
import { NepalDataEngine } from '../src/generator/nepalDataEngine';
import { NEPAL_GEOGRAPHY, MALE_FIRST_NAMES, FEMALE_FIRST_NAMES, SURNAMES } from '../src/generator/nepalData';

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

  it('ensures NEPAL_GEOGRAPHY provides a complete tree with 77 districts and municipalities', () => {
    expect(NEPAL_GEOGRAPHY.length).toBe(7);

    let totalDistricts = 0;
    NEPAL_GEOGRAPHY.forEach((prov) => {
      totalDistricts += prov.districts.length;
      prov.districts.forEach((dist) => {
        expect(dist.municipalities.length).toBeGreaterThan(0);
        dist.municipalities.forEach((m) => {
          expect(m.name).toBeTruthy();
          expect(m.maxWards).toBeGreaterThan(0);
        });
      });
    });

    expect(totalDistricts).toBe(77);
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
