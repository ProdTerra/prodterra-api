import type { Range } from '../domain/catalogValues.js';
import { demoCrops, demoPests, demoSourceLabel } from './demoCatalogData.js';
import { seedCrops, seedFamilies } from './catalogSeedData.js';

function isFilledRange(range: Range): boolean {
  return range.minimum !== null && range.maximum !== null && range.minimum <= range.maximum;
}

describe('demo catalog data', () => {
  it('only uses the ten project crops', () => {
    expect(demoCrops.map((crop) => crop.key)).toEqual(seedCrops.map((crop) => crop.key));
  });

  it('fills every range of every crop with a valid minimum and maximum', () => {
    for (const crop of demoCrops) {
      const ranges = [
        crop.altitudeInMeters,
        crop.latitudeInDegrees,
        crop.temperatureInCelsius,
        crop.waterNeedInMillimetersPerCycle,
        crop.relativeHumidityInPercent,
        crop.solarRadiationInKilowattHoursPerSquareMeterPerDay,
        crop.cycleLengthInDays,
      ];
      expect(ranges.every(isFilledRange)).toBe(true);
      expect(crop.demandLevel).not.toBeNull();
      expect(crop.nutrients.length).toBeGreaterThan(0);
    }
  });

  it('includes plenty of pests linked to families and crops that exist', () => {
    const familyKeys = seedFamilies.map((family) => family.key);
    const cropKeys = demoCrops.map((crop) => crop.key);
    expect(demoPests.length).toBeGreaterThanOrEqual(15);
    expect(new Set(demoPests.map((pest) => pest.key)).size).toBe(demoPests.length);
    for (const pest of demoPests) {
      expect(pest.affectedFamilyKeys.length).toBeGreaterThan(0);
      expect(pest.affectedFamilyKeys.every((familyKey) => familyKeys.includes(familyKey))).toBe(true);
      expect(pest.onlyAffectsCropKeys.every((cropKey) => cropKeys.includes(cropKey))).toBe(true);
      expect(isFilledRange(pest.temperatureInCelsius)).toBe(true);
    }
  });

  it('gives every crop at least one pest', () => {
    for (const crop of demoCrops) {
      const pestsForCrop = demoPests.filter(
        (pest) =>
          pest.affectedFamilyKeys.includes(crop.familyKey) &&
          (pest.onlyAffectsCropKeys.length === 0 || pest.onlyAffectsCropKeys.includes(crop.key)),
      );
      expect(pestsForCrop.length).toBeGreaterThan(0);
    }
  });

  it('marks every demo value with the fictitious data source', () => {
    for (const entry of [...demoCrops, ...demoPests]) {
      expect(entry.sources.some((source) => source.label === demoSourceLabel)).toBe(true);
    }
  });
});
