import type { Crop } from './crop.js';
import type { Pest } from './pest.js';
import type { PlantFamily } from './plantFamily.js';

export abstract class CatalogRepository {
  abstract findFamilies(): Promise<PlantFamily[]>;
  abstract findCrops(): Promise<Crop[]>;
  abstract findCropByKey(key: string): Promise<Crop | null>;
  abstract findPests(): Promise<Pest[]>;
}
