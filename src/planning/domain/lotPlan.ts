import { referenceCycleInDays } from '../../catalog/domain/referenceCycle.js';
import type { Crop } from '../../catalog/domain/crop.js';
import type { Pest } from '../../catalog/domain/pest.js';
import type { MonthlyClimate } from '../../climate/domain/monthlyClimate.js';
import { addMonths, harvestMonth, monthNumberOf, monthsBetween, monthsFrom, type MonthKey } from './monthKeys.js';
import { assessMonth, type MonthStatus, type PlanAlert } from './monthlyAssessment.js';
import { recommendNextCrops, type CropRecommendation, type PreviousUse } from './recommendation.js';

export type CurrentUse = { kind: 'crop'; cropKey: string; plantedOn: MonthKey } | { kind: 'fallow' };

export type MonthPhase = 'current' | 'next' | 'free';

export type PlanMonth = {
  month: MonthKey;
  cropKey: string | null;
  phase: MonthPhase;
  status: MonthStatus;
  alerts: PlanAlert[];
};

export type CurrentCropPlan = {
  cropKey: string;
  plantedOn: MonthKey;
  harvestMonth: MonthKey;
  cycleIsEstimated: boolean;
};

export type LotPlan = {
  lotId: string;
  currentCrop: CurrentCropPlan | null;
  nextCrop: CropRecommendation | null;
  recommendations: CropRecommendation[];
  months: PlanMonth[];
};

type LotPlanInput = {
  lotId: string;
  crops: Crop[];
  pests: Pest[];
  climate: MonthlyClimate[];
  lotElevationInMeters: number;
  startMonth: MonthKey;
  horizonInMonths: number;
  hasIrrigation: boolean;
  currentUse: CurrentUse;
  previousUse: PreviousUse;
};

const estimatedCycleLengthInDays = 90;
const recommendationsShown = 3;

function knownCycleLength(crop: Crop): number | null {
  return referenceCycleInDays(crop.cycleLengthInDays);
}

function planCurrentCrop(currentUse: CurrentUse, crops: Crop[]): { plan: CurrentCropPlan; crop: Crop } | null {
  if (currentUse.kind !== 'crop') {
    return null;
  }
  const crop = crops.find((candidate) => candidate.key === currentUse.cropKey);
  if (!crop) {
    return null;
  }
  const cycle = knownCycleLength(crop);
  return {
    crop,
    plan: {
      cropKey: crop.key,
      plantedOn: currentUse.plantedOn,
      harvestMonth: harvestMonth(currentUse.plantedOn, cycle ?? estimatedCycleLengthInDays),
      cycleIsEstimated: cycle === null,
    },
  };
}

function cropForMonth(
  month: MonthKey,
  current: { plan: CurrentCropPlan; crop: Crop } | null,
  next: { recommendation: CropRecommendation; crop: Crop } | null,
): { crop: Crop | null; phase: MonthPhase } {
  if (current && monthsBetween(month, current.plan.harvestMonth) >= 0) {
    return { crop: current.crop, phase: 'current' };
  }
  if (next && monthsBetween(next.recommendation.sowMonth, month) >= 0 && monthsBetween(month, next.recommendation.harvestMonth) >= 0) {
    return { crop: next.crop, phase: 'next' };
  }
  return { crop: null, phase: 'free' };
}

export function buildLotPlan(input: LotPlanInput): LotPlan {
  const current = planCurrentCrop(input.currentUse, input.crops);
  const currentIsGrowing = current !== null && monthsBetween(input.startMonth, current.plan.harvestMonth) >= 0;
  const sowMonth = currentIsGrowing && current ? addMonths(current.plan.harvestMonth, 1) : input.startMonth;
  const previousUse: PreviousUse =
    current && !currentIsGrowing ? { kind: 'crop', cropKey: current.crop.key } : input.previousUse;

  const recommendations = recommendNextCrops({
    candidates: input.crops,
    pests: input.pests,
    climate: input.climate,
    lotElevationInMeters: input.lotElevationInMeters,
    sowMonth,
    hasIrrigation: input.hasIrrigation,
    lastCrop: currentIsGrowing && current ? current.crop : null,
    previousUse,
  });
  const nextRecommendation = recommendations[0] ?? null;
  const nextCrop = nextRecommendation
    ? { recommendation: nextRecommendation, crop: input.crops.find((crop) => crop.key === nextRecommendation.cropKey) as Crop }
    : null;

  const months = monthsFrom(input.startMonth, input.horizonInMonths).map((month): PlanMonth => {
    const { crop, phase } = cropForMonth(month, currentIsGrowing ? current : null, nextCrop);
    const climate = input.climate.find((candidate) => candidate.month === monthNumberOf(month));
    const assessment = climate
      ? assessMonth({ crop, pests: input.pests, climate, hasIrrigation: input.hasIrrigation })
      : { status: 'ok' as const, alerts: [] };
    return { month, cropKey: crop?.key ?? null, phase, ...assessment };
  });

  return {
    lotId: input.lotId,
    currentCrop: current?.plan ?? null,
    nextCrop: nextRecommendation,
    recommendations: recommendations.slice(0, recommendationsShown),
    months,
  };
}
