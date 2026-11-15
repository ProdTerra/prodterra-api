import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { CatalogService } from '../application/catalog.service.js';
import type { Crop } from '../domain/crop.js';
import type { Pest } from '../domain/pest.js';
import type { PlantFamily } from '../domain/plantFamily.js';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('families')
  findFamilies(): Promise<PlantFamily[]> {
    return this.catalogService.findFamilies();
  }

  @Get('crops')
  findCrops(): Promise<Crop[]> {
    return this.catalogService.findCrops();
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
