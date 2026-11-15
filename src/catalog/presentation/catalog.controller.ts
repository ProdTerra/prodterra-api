import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { CatalogService } from '../application/catalog.service.js';
import { toFamilyResponse, toPestResponse, type FamilyResponse, type PestResponse } from './catalogResponses.js';
import { toCropResponse, type CropResponse } from './cropResponse.js';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('families')
  async findFamilies(): Promise<FamilyResponse[]> {
    const families = await this.catalogService.findFamilies();
    return families.map(toFamilyResponse);
  }

  @Get('crops')
  async findCrops(): Promise<CropResponse[]> {
    const crops = await this.catalogService.findCrops();
    return crops.map(toCropResponse);
  }

  @Get('pests')
  async findPests(): Promise<PestResponse[]> {
    const pests = await this.catalogService.findPests();
    return pests.map(toPestResponse);
  }

  @Get('crops/:cropKey/pests')
  async findPestsForCrop(@Param('cropKey') cropKey: string): Promise<PestResponse[]> {
    const pests = await this.catalogService.findPestsForCrop(cropKey);
    if (!pests) {
      throw new NotFoundException(`Crop ${cropKey} is not in the catalog`);
    }
    return pests.map(toPestResponse);
  }
}
