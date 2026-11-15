import { Module } from '@nestjs/common';
import { TerrainService } from './application/terrain.service.js';
import { ElevationProvider } from './domain/elevationProvider.js';
import { PlanetaryComputerNasademProvider } from './infrastructure/planetaryComputerNasademProvider.js';
import { TerrainController } from './presentation/terrain.controller.js';

@Module({
  controllers: [TerrainController],
  providers: [TerrainService, { provide: ElevationProvider, useClass: PlanetaryComputerNasademProvider }],
})
export class TerrainModule {}
