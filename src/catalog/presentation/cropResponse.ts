import type { Crop } from '../domain/crop.js';
import { referenceCycleInDays } from '../domain/referenceCycle.js';

export type CropResponse = Crop & { referenceCycleInDays: number | null };

export function toCropResponse(crop: Crop): CropResponse {
  return { ...crop, referenceCycleInDays: referenceCycleInDays(crop.cycleLengthInDays) };
}
