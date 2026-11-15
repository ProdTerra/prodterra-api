import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module.js';
import { ClimateModule } from '../climate/climate.module.js';
import { PlanningService } from './application/planning.service.js';
import { PlanningController } from './presentation/planning.controller.js';

@Module({
  imports: [CatalogModule, ClimateModule],
  controllers: [PlanningController],
  providers: [PlanningService],
})
export class PlanningModule {}
