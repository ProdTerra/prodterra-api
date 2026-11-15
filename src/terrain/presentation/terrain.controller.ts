import { Controller, Get, NotFoundException, Query } from '@nestjs/common';
import { TerrainService } from '../application/terrain.service.js';
import type { ElevationReading } from '../domain/elevationReading.js';
import { ElevationQueryDto } from './elevationQuery.dto.js';

@Controller('terrain')
export class TerrainController {
  constructor(private readonly terrainService: TerrainService) {}

  @Get('elevation')
  async getElevation(@Query() query: ElevationQueryDto): Promise<ElevationReading> {
    const reading = await this.terrainService.getElevation(query);
    if (!reading) {
      throw new NotFoundException('No elevation data for this point');
    }
    return reading;
  }
}
