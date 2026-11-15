import { seedCrops, seedFamilies } from './catalogSeedData.js';

describe('catalog seed data', () => {
  it('uses unique keys', () => {
    const familyKeys = seedFamilies.map((family) => family.key);
    const cropKeys = seedCrops.map((crop) => crop.key);
    expect(new Set(familyKeys).size).toBe(familyKeys.length);
    expect(new Set(cropKeys).size).toBe(cropKeys.length);
  });

  it('links every crop to a family that exists', () => {
    const familyKeys = new Set(seedFamilies.map((family) => family.key));
    for (const crop of seedCrops) {
      expect(familyKeys.has(crop.familyKey)).toBe(true);
    }
  });

  it('contains the six focus crops for Cartago', () => {
    expect(seedCrops.map((crop) => crop.key)).toEqual(['potato', 'cabbage', 'broccoli', 'carrot', 'onion', 'lettuce']);
  });
});
