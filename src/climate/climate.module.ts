import { Module } from '@nestjs/common';
import { TerrainModule } from '../terrain/terrain.module.js';
import { LotClimateProfileService } from './application/lotClimateProfile.service.js';
import { ClimatologyProvider } from './domain/climatologyProvider.js';
import { NasaPowerClimatologyProvider } from './infrastructure/nasaPowerClimatologyProvider.js';
import { LotClimateProfileController } from './presentation/lotClimateProfile.controller.js';

@Module({
  imports: [TerrainModule],
  controllers: [LotClimateProfileController],
  providers: [LotClimateProfileService, { provide: ClimatologyProvider, useClass: NasaPowerClimatologyProvider }],
  exports: [LotClimateProfileService],
})
export class ClimateModule {}
