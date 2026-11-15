import type { Crop } from './crop.js';
import type { Pest } from './pest.js';

export function pestsThatAffect(crop: Crop, pests: Pest[]): Pest[] {
  return pests.filter((pest) => {
    const attacksFamily = pest.affectedFamilyKeys.includes(crop.familyKey);
    const isLimitedToOtherCrops =
      pest.onlyAffectsCropKeys.length > 0 && !pest.onlyAffectsCropKeys.includes(crop.key);
    return attacksFamily && !isLimitedToOtherCrops;
  });
}
