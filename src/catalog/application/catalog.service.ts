import { Injectable } from '@nestjs/common';
import { CatalogRepository } from '../domain/catalogRepository.js';
import type { Crop } from '../domain/crop.js';
import type { Pest } from '../domain/pest.js';
import { pestsThatAffect } from '../domain/pestsForCrop.js';
import type { PlantFamily } from '../domain/plantFamily.js';

@Injectable()
export class CatalogService {
  constructor(private readonly catalogRepository: CatalogRepository) {}

  findFamilies(): Promise<PlantFamily[]> {
    return this.catalogRepository.findFamilies();
  }

  findCrops(): Promise<Crop[]> {
    return this.catalogRepository.findCrops();
  }

  findPests(): Promise<Pest[]> {
    return this.catalogRepository.findPests();
  }

  async findPestsForCrop(cropKey: string): Promise<Pest[] | null> {
    const crop = await this.catalogRepository.findCropByKey(cropKey);
    if (!crop) {
      return null;
    }
    return pestsThatAffect(crop, await this.catalogRepository.findPests());
  }
}
