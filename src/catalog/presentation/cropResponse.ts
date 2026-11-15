import type { Crop } from '../domain/crop.js';
import { referenceCycleInDays } from '../domain/referenceCycle.js';
import { toLocalizedNameResponse, type LocalizedNameResponse } from './catalogResponses.js';

export type CropResponse = Omit<Crop, 'name'> & { name: LocalizedNameResponse; referenceCycleInDays: number | null };

export function toCropResponse(crop: Crop): CropResponse {
  return {
    ...crop,
    name: toLocalizedNameResponse(crop.name),
    referenceCycleInDays: referenceCycleInDays(crop.cycleLengthInDays),
  };
}
