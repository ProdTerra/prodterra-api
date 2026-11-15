import { Injectable } from '@nestjs/common';
import { CatalogRepository } from '../../catalog/domain/catalogRepository.js';
import type { Crop } from '../../catalog/domain/crop.js';
import type { Pest } from '../../catalog/domain/pest.js';
import { demoSourceLabel } from '../../catalog/seed/demoCatalogData.js';
import { LotClimateProfileService } from '../../climate/application/lotClimateProfile.service.js';
import { buildLotPlan, type LotPlan } from '../domain/lotPlan.js';
import type { LotPlanRequest, PlanRequest } from '../domain/planRequest.js';

export type LotPlanResult = LotPlan & { elevationInMeters: number | null; climateAvailable: boolean };

export type PlanResult = {
  startMonth: string;
  horizonInMonths: number;
  usesDemoData: boolean;
  crops: Pick<Crop, 'key' | 'name' | 'familyKey'>[];
  pests: Pick<Pest, 'key' | 'name' | 'type'>[];
  lots: LotPlanResult[];
};

@Injectable()
export class PlanningService {
  constructor(
    private readonly catalogRepository: CatalogRepository,
    private readonly lotClimateProfileService: LotClimateProfileService,
  ) {}

  async buildPlans(request: PlanRequest): Promise<PlanResult> {
    const [crops, pests] = await Promise.all([this.catalogRepository.findCrops(), this.catalogRepository.findPests()]);
    const lots = await Promise.all(request.lots.map((lot) => this.planLot(lot, request, crops, pests)));
    return {
      startMonth: request.startMonth,
      horizonInMonths: request.horizonInMonths,
      usesDemoData: [...crops, ...pests].some((entry) => entry.sources.some((source) => source.label === demoSourceLabel)),
      crops: crops.map(({ key, name, familyKey }) => ({ key, name, familyKey })),
      pests: pests.map(({ key, name, type }) => ({ key, name, type })),
      lots,
    };
  }

  private async planLot(lot: LotPlanRequest, request: PlanRequest, crops: Crop[], pests: Pest[]): Promise<LotPlanResult> {
    const profile = await this.lotClimateProfileService.buildProfile(lot.boundary);
    if (!profile) {
      return {
        lotId: lot.lotId,
        currentCrop: null,
        nextCrop: null,
        recommendations: [],
        months: [],
        elevationInMeters: null,
        climateAvailable: false,
      };
    }
    const plan = buildLotPlan({
      lotId: lot.lotId,
      crops,
      pests,
      climate: profile.months,
      lotElevationInMeters: profile.elevation.meanInMeters,
      startMonth: request.startMonth,
      horizonInMonths: request.horizonInMonths,
      hasIrrigation: lot.hasIrrigation,
      currentUse: lot.currentUse,
      previousUse: lot.previousUse,
    });
    return { ...plan, elevationInMeters: profile.elevation.meanInMeters, climateAvailable: true };
  }
}
