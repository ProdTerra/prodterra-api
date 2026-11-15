import type { Range } from '../domain/catalogValues.js';
import { seedCrops, seedFamilies, seedPests } from './catalogSeedData.js';

function isOrdered(range: Range): boolean {
  return range.minimum === null || range.maximum === null || range.minimum <= range.maximum;
}

const cropByKey = (key: string) => seedCrops.find((crop) => crop.key === key);

describe('catalog seed data from the spreadsheet', () => {
  it('contains the twelve crops of the spreadsheet, in its order', () => {
    expect(seedCrops.map((crop) => crop.key)).toEqual([
      'potato',
      'onion',
      'tomato',
      'eggplant',
      'cilantro',
      'sweet-pepper',
      'avocado',
      'cassava',
      'sugarcane',
      'cabbage',
      'coffee',
      'maize',
    ]);
  });

  it('maps every spreadsheet family to one family key', () => {
    expect(seedFamilies.map((family) => [family.key, family.scientificName, family.name.es])).toEqual([
      ['solanaceae', 'Solanaceae', 'Solanáceas'],
      ['amaryllidaceae', 'Amaryllidaceae', 'Amarilidáceas'],
      ['apiaceae', 'Apiaceae', 'Apiaceae'],
      ['lauraceae', 'Lauraceae', 'Lauráceas'],
      ['euphorbiaceae', 'Euphorbiaceae', 'Euforbiaceae'],
      ['poaceae', 'Poaceae', 'Poaceae'],
      ['brassicaceae', 'Brassicaceae', 'Brasicáceas'],
      ['rubiaceae', 'Rubiaceae', 'Rubiáceas'],
    ]);
    expect(cropByKey('maize')?.familyKey).toBe('poaceae');
    expect(cropByKey('sugarcane')?.familyKey).toBe('poaceae');
  });

  it('uses unique keys', () => {
    for (const keys of [seedFamilies, seedCrops, seedPests].map((entries) => entries.map((entry) => entry.key))) {
      expect(new Set(keys).size).toBe(keys.length);
    }
  });

  it('links every crop and every pest to a family that exists', () => {
    const familyKeys = seedFamilies.map((family) => family.key);
    expect(seedCrops.every((crop) => familyKeys.includes(crop.familyKey))).toBe(true);
    for (const pest of seedPests) {
      expect(pest.affectedFamilyKeys.length).toBeGreaterThan(0);
      expect(pest.affectedFamilyKeys.every((familyKey) => familyKeys.includes(familyKey))).toBe(true);
    }
  });

  it('keeps every range ordered from minimum to maximum', () => {
    for (const crop of seedCrops) {
      const ranges = [
        crop.altitudeInMeters,
        crop.temperatureInCelsius,
        crop.waterNeedInMillimetersPerCycle,
        crop.relativeHumidityInPercent,
        crop.cycleLengthInDays,
      ];
      expect(ranges.every(isOrdered)).toBe(true);
    }
  });

  it('copies the values of a spreadsheet row', () => {
    expect(cropByKey('potato')).toMatchObject({
      name: { es: 'Papa' },
      familyKey: 'solanaceae',
      nutrients: [{ nutrient: 'N' }],
      altitudeInMeters: { minimum: 1500, maximum: 2600 },
      temperatureInCelsius: { minimum: 15, maximum: 25 },
      waterNeedInMillimetersPerCycle: { minimum: 500, maximum: 700 },
      relativeHumidityInPercent: { minimum: 70, maximum: 80 },
      cycleLengthInDays: { minimum: 80, maximum: 80 },
    });
    expect(cropByKey('avocado')?.cycleLengthInDays).toEqual({ minimum: 1825, maximum: 1825 });
  });

  it('leaves empty what the spreadsheet does not have instead of guessing', () => {
    for (const crop of seedCrops) {
      expect(crop.demandLevel).toBeNull();
      expect(crop.nutrients.every((demand) => demand.level === undefined)).toBe(true);
      expect(crop.solarRadiationInKilowattHoursPerSquareMeterPerDay).toEqual({ minimum: null, maximum: null });
    }
    expect(['onion', 'avocado', 'coffee'].map((key) => cropByKey(key)?.relativeHumidityInPercent.minimum)).toEqual([
      null,
      null,
      null,
    ]);
  });

  it('names every crop, family and pest in English and every crop scientifically', () => {
    for (const entry of [...seedCrops, ...seedFamilies, ...seedPests]) {
      expect(entry.name.en?.length).toBeGreaterThan(0);
    }
    expect(seedCrops.every((crop) => crop.scientificName !== null)).toBe(true);
    expect(cropByKey('potato')).toMatchObject({ name: { es: 'Papa', en: 'Potato' }, scientificName: 'Solanum tuberosum' });
  });

  it('takes the scientific name of a pest from its parentheses or from a text that is already one', () => {
    const pestByKey = (key: string) => seedPests.find((pest) => pest.key === key);
    expect(pestByKey('mancha-purpura-alternaria-porri')).toMatchObject({
      name: { es: 'Mancha púrpura (Alternaria porri)', en: 'Purple blotch' },
      scientificName: 'Alternaria porri',
    });
    expect(pestByKey('erynnis-ello')).toMatchObject({ name: { es: 'Erynnis ello', en: 'Erynnis ello' }, scientificName: 'Erynnis ello' });
    expect(pestByKey('polilla-dorso-de-diamante')).toMatchObject({ name: { en: 'Diamondback moth' }, scientificName: null });
  });

  it('uses the swapped eggplant columns confirmed by the team', () => {
    const pestByKey = (key: string) => seedPests.find((pest) => pest.key === key);
    expect(pestByKey('agrotis-sp')?.type).toBe('pest');
    expect(pestByKey('tetranychus-urticae-koch')?.type).toBe('pest');
    expect(pestByKey('alternaria-solani')?.type).toBe('disease');
    expect(pestByKey('phytophthora-infestans')?.type).toBe('disease');
    expect(cropByKey('eggplant')?.sources.some((source) => source.label.includes('intercambiadas'))).toBe(true);
  });

  it('uses the minimum tomato temperature given by the team', () => {
    expect(cropByKey('tomato')?.temperatureInCelsius).toEqual({ minimum: 18, maximum: 29 });
    expect(cropByKey('tomato')?.sources).toContainEqual({ label: 'Dato del equipo ProdTerra (2026-11-15)', url: null });
  });

  it('cites the spreadsheet links of every crop', () => {
    for (const crop of seedCrops) {
      expect(crop.sources.some((source) => source.label.startsWith(`${crop.name.es} - `))).toBe(true);
      expect(crop.sources.some((source) => source.url?.includes('inta.go.cr'))).toBe(true);
    }
  });

  it('builds the pests from the disease and pest columns', () => {
    const pestByKey = (key: string) => seedPests.find((pest) => pest.key === key);
    expect(pestByKey('mancha-purpura-alternaria-porri')).toMatchObject({ type: 'disease', affectedFamilyKeys: ['amaryllidaceae'] });
    expect(pestByKey('polilla-dorso-de-diamante')).toMatchObject({ type: 'pest', affectedFamilyKeys: ['brassicaceae'] });
    expect(pestByKey('tetranychus-urticae')).toMatchObject({ type: 'pest', affectedFamilyKeys: ['euphorbiaceae'] });
    expect(pestByKey('marchitez-bacterial')?.affectedFamilyKeys).toEqual(['solanaceae']);
    expect(seedPests.some((pest) => pest.name.es === 'N/A')).toBe(false);
  });

  it('gives the family of every crop at least one pest', () => {
    for (const crop of seedCrops) {
      const pestsOfFamily = seedPests.filter((pest) => pest.affectedFamilyKeys.includes(crop.familyKey));
      expect(pestsOfFamily.some((pest) => pest.type === 'pest')).toBe(true);
    }
  });
});
