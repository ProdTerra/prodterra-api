import { Injectable } from '@nestjs/common';
import { CatalogRepository } from '../../catalog/domain/catalogRepository.js';
import type { Crop } from '../../catalog/domain/crop.js';
import type { Pest } from '../../catalog/domain/pest.js';
import { toLocalizedNameResponse, type LocalizedNameResponse } from '../../catalog/presentation/catalogResponses.js';
import { demoSourceLabel } from '../../catalog/seed/demoCatalogData.js';
import type { MonthlyClimate } from '../../climate/domain/monthlyClimate.js';
import { LotClimateProfileService } from '../../climate/application/lotClimateProfile.service.js';
import { buildLotPlan, type LotPlan } from '../domain/lotPlan.js';
import type { LotPlanRequest, PlanRequest } from '../domain/planRequest.js';
import { evaluateRotation, recommendRotation, type EvaluatedRotation, type RotationContext } from '../domain/rotationEvaluation.js';
import type { LotRotationRequest, RotationEvaluationRequest } from '../domain/rotationEvaluationRequest.js';

type CatalogCropSummary = Pick<Crop, 'key' | 'familyKey'> & { name: LocalizedNameResponse };
type CatalogPestSummary = Pick<Pest, 'key' | 'type'> & { name: LocalizedNameResponse };

function summarizeCrops(crops: Crop[]): CatalogCropSummary[] {
  return crops.map(({ key, name, familyKey }) => ({ key, name: toLocalizedNameResponse(name), familyKey }));
}

function summarizePests(pests: Pest[]): CatalogPestSummary[] {
  return pests.map(({ key, name, type }) => ({ key, name: toLocalizedNameResponse(name), type }));
}

export type LotPlanResult = LotPlan & { elevationInMeters: number | null; climateAvailable: boolean };

export type PlanResult = {
  startMonth: string;
  horizonInMonths: number;
  usesDemoData: boolean;
  crops: CatalogCropSummary[];
  pests: CatalogPestSummary[];
  lots: LotPlanResult[];
};

export type LotRotationEvaluation = {
  lotId: string;
  climateAvailable: boolean;
  elevationInMeters: number | null;
  climate: MonthlyClimate[];
  farmer: EvaluatedRotation | null;
  recommended: EvaluatedRotation | null;
};

export type RotationEvaluationResult = {
  startDate: string;
  usesDemoData: boolean;
  crops: CatalogCropSummary[];
  pests: CatalogPestSummary[];
  lots: LotRotationEvaluation[];
};

function usesDemoData(crops: Crop[], pests: Pest[]): boolean {
  return [...crops, ...pests].some((entry) => entry.sources.some((source) => source.label === demoSourceLabel));
}

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
      usesDemoData: usesDemoData(crops, pests),
      crops: summarizeCrops(crops),
      pests: summarizePests(pests),
      lots,
    };
  }

  async evaluateRotations(request: RotationEvaluationRequest): Promise<RotationEvaluationResult> {
    const [crops, pests] = await Promise.all([this.catalogRepository.findCrops(), this.catalogRepository.findPests()]);
    const lots = await Promise.all(request.lots.map((lot) => this.evaluateLot(lot, request.startDate, crops, pests)));
    return {
      startDate: request.startDate,
      usesDemoData: usesDemoData(crops, pests),
      crops: summarizeCrops(crops),
      pests: summarizePests(pests),
      lots,
    };
  }

  private async evaluateLot(lot: LotRotationRequest, startDate: string, crops: Crop[], pests: Pest[]): Promise<LotRotationEvaluation> {
    const profile = await this.lotClimateProfileService.buildProfile(lot.boundary);
    if (!profile) {
      return { lotId: lot.lotId, climateAvailable: false, elevationInMeters: null, climate: [], farmer: null, recommended: null };
    }
    const context: RotationContext = {
      crops,
      pests,
      climate: profile.months,
      lotElevationInMeters: profile.elevation.meanInMeters,
      hasIrrigation: lot.hasIrrigation,
      previousUse: lot.previousUse,
    };
    const farmer = evaluateRotation(startDate, lot.blocks, context);
    const farmerEnd = farmer.blocks[farmer.blocks.length - 1].endsOn;
    return {
      lotId: lot.lotId,
      climateAvailable: true,
      elevationInMeters: profile.elevation.meanInMeters,
      climate: profile.months,
      farmer,
      recommended: recommendRotation(startDate, farmerEnd, context),
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
