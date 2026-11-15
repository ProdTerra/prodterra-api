import { seedCrops, seedFamilies } from './catalogSeedData.js';

describe('catalog seed data', () => {
  it('contains exactly the ten crops chosen for the project, in this order', () => {
    expect(seedCrops.map((crop) => crop.key)).toEqual([
      'potato',
      'onion',
      'carrot',
      'cabbage',
      'lettuce',
      'chayote',
      'tomato',
      'broccoli',
      'cauliflower',
      'strawberry',
    ]);
  });

  it('uses unique keys', () => {
    const familyKeys = seedFamilies.map((family) => family.key);
    const cropKeys = seedCrops.map((crop) => crop.key);
    expect(new Set(familyKeys).size).toBe(familyKeys.length);
    expect(new Set(cropKeys).size).toBe(cropKeys.length);
  });

  it('links every crop to a family that exists and only keeps families that are used', () => {
    const familyKeys = seedFamilies.map((family) => family.key);
    const usedFamilyKeys = new Set(seedCrops.map((crop) => crop.familyKey));
    expect(seedCrops.every((crop) => familyKeys.includes(crop.familyKey))).toBe(true);
    expect(familyKeys.every((familyKey) => usedFamilyKeys.has(familyKey))).toBe(true);
  });

  it('cites a source with a link for every cycle length it states', () => {
    for (const crop of seedCrops.filter((candidate) => candidate.cycleLengthInDays.maximum !== null)) {
      expect(crop.sources.some((source) => source.label.includes('SEPSA') && source.url?.startsWith('https://'))).toBe(true);
    }
  });

  it('leaves unknown values empty instead of guessing', () => {
    const lettuce = seedCrops.find((crop) => crop.key === 'lettuce');
    const chayote = seedCrops.find((crop) => crop.key === 'chayote');
    expect(lettuce?.cycleLengthInDays).toEqual({ minimum: null, maximum: null });
    expect(chayote?.demandLevel).toBeNull();
    expect(chayote?.nutrients).toEqual([]);
  });
});
