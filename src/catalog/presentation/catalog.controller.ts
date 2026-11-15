import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { CatalogService } from '../application/catalog.service.js';
import type { Pest } from '../domain/pest.js';
import type { PlantFamily } from '../domain/plantFamily.js';
import { toCropResponse, type CropResponse } from './cropResponse.js';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('families')
  findFamilies(): Promise<PlantFamily[]> {
    return this.catalogService.findFamilies();
  }

  @Get('crops')
  async findCrops(): Promise<CropResponse[]> {
    const crops = await this.catalogService.findCrops();
    return crops.map(toCropResponse);
  }

  @Get('pests')
  findPests(): Promise<Pest[]> {
    return this.catalogService.findPests();
  }

  @Get('crops/:cropKey/pests')
  async findPestsForCrop(@Param('cropKey') cropKey: string): Promise<Pest[]> {
    const pests = await this.catalogService.findPestsForCrop(cropKey);
    if (!pests) {
      throw new NotFoundException(`Crop ${cropKey} is not in the catalog`);
    }
    return pests;
  }
}
