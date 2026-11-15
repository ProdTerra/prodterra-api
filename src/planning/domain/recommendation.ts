import type { Range } from '../../catalog/domain/catalogValues.js';
import type { Crop, Nutrient } from '../../catalog/domain/crop.js';
import type { Pest } from '../../catalog/domain/pest.js';
import type { MonthlyClimate } from '../../climate/domain/monthlyClimate.js';
import { harvestMonth, monthNumberOf, monthsBetween, monthsFrom, type MonthKey } from './monthKeys.js';
import { assessMonth } from './monthlyAssessment.js';

export type PreviousUse = { kind: 'crop'; cropKey: string } | { kind: 'fallow' } | { kind: 'unknown' };

export type RecommendationReason =
  | { type: 'sameFamily'; familyKey: string; positive: false }
  | { type: 'differentFamily'; positive: true }
  | { type: 'sameNutrient'; nutrient: Nutrient; positive: false }
  | { type: 'differentNutrient'; nutrient: Nutrient; positive: true }
  | { type: 'highAfterHighDemand'; positive: false }
  | { type: 'restAfterHighDemand'; positive: true }
  | { type: 'afterRest'; positive: true }
  | { type: 'unknownHistory'; positive: false }
  | { type: 'altitudeOutOfRange'; positive: false }
  | { type: 'climateFit'; suitableMonths: number; totalMonths: number; positive: boolean }
  | { type: 'pestMonths'; months: number; positive: false };

export type CropRecommendation = {
  cropKey: string;
  score: number;
  fitsAltitude: boolean;
  sowMonth: MonthKey;
  harvestMonth: MonthKey;
  reasons: RecommendationReason[];
};

type RecommendationInput = {
  candidates: Crop[];
  pests: Pest[];
  climate: MonthlyClimate[];
  lotElevationInMeters: number;
  sowMonth: MonthKey;
  hasIrrigation: boolean;
  lastCrop: Crop | null;
  previousUse: PreviousUse;
};

const weights = {
  sameFamily: -5,
  differentFamily: 3,
  sameNutrient: -2,
  differentNutrient: 1,
  highAfterHighDemand: -1,
  restAfterHighDemand: 1,
  climateFit: 4,
  pestMonth: -0.5,
};

const defaultCycleLengthInDays = 90;
const levelOrder = { high: 3, medium: 2, low: 1 } as const;

function dominantNutrient(crop: Crop): Nutrient | null {
  const [strongest] = [...crop.nutrients].sort((first, second) => levelOrder[second.level] - levelOrder[first.level]);
  return strongest?.nutrient ?? null;
}

function isWithin(value: number, range: Range): boolean {
  return (range.minimum === null || value >= range.minimum) && (range.maximum === null || value <= range.maximum);
}

function cycleLength(crop: Crop): number {
  const { minimum, maximum } = crop.cycleLengthInDays;
  if (minimum !== null && maximum !== null) {
    return (minimum + maximum) / 2;
  }
  return minimum ?? maximum ?? defaultCycleLengthInDays;
}

function rotationReasons(candidate: Crop, reference: Crop): { score: number; reasons: RecommendationReason[] } {
  const reasons: RecommendationReason[] = [];
  let score = 0;
  if (candidate.familyKey === reference.familyKey) {
    reasons.push({ type: 'sameFamily', familyKey: candidate.familyKey, positive: false });
    score += weights.sameFamily;
  } else {
    reasons.push({ type: 'differentFamily', positive: true });
    score += weights.differentFamily;
  }
  const candidateNutrient = dominantNutrient(candidate);
  const referenceNutrient = dominantNutrient(reference);
  if (candidateNutrient && referenceNutrient) {
    if (candidateNutrient === referenceNutrient) {
      reasons.push({ type: 'sameNutrient', nutrient: candidateNutrient, positive: false });
      score += weights.sameNutrient;
    } else {
      reasons.push({ type: 'differentNutrient', nutrient: candidateNutrient, positive: true });
      score += weights.differentNutrient;
    }
  }
  if (reference.demandLevel === 'high') {
    if (candidate.demandLevel === 'high') {
      reasons.push({ type: 'highAfterHighDemand', positive: false });
      score += weights.highAfterHighDemand;
    } else if (candidate.demandLevel !== null) {
      reasons.push({ type: 'restAfterHighDemand', positive: true });
      score += weights.restAfterHighDemand;
    }
  }
  return { score, reasons };
}

function historyReasons(
  candidate: Crop,
  lastCrop: Crop | null,
  previousUse: PreviousUse,
  catalog: Crop[],
): { score: number; reasons: RecommendationReason[] } {
  if (lastCrop) {
    return rotationReasons(candidate, lastCrop);
  }
  if (previousUse.kind === 'fallow') {
    return { score: 0, reasons: [{ type: 'afterRest', positive: true }] };
  }
  const previousCrop =
    previousUse.kind === 'crop' ? catalog.find((crop) => crop.key === previousUse.cropKey) : undefined;
  if (previousCrop) {
    return rotationReasons(candidate, previousCrop);
  }
  return { score: 0, reasons: [{ type: 'unknownHistory', positive: false }] };
}

function climateReasons(
  candidate: Crop,
  input: RecommendationInput,
  harvest: MonthKey,
): { score: number; reasons: RecommendationReason[] } {
  const cycleMonths = monthsFrom(input.sowMonth, monthsBetween(input.sowMonth, harvest) + 1);
  let suitableMonths = 0;
  let pestMonths = 0;
  for (const month of cycleMonths) {
    const climate = input.climate.find((candidateMonth) => candidateMonth.month === monthNumberOf(month));
    if (!climate) {
      continue;
    }
    const assessment = assessMonth({ crop: candidate, pests: input.pests, climate, hasIrrigation: input.hasIrrigation });
    if (assessment.status !== 'risk') {
      suitableMonths += 1;
    }
    if (assessment.alerts.some((alert) => alert.type === 'pest')) {
      pestMonths += 1;
    }
  }
  const totalMonths = cycleMonths.length;
  const reasons: RecommendationReason[] = [
    { type: 'climateFit', suitableMonths, totalMonths, positive: suitableMonths === totalMonths },
  ];
  if (pestMonths > 0) {
    reasons.push({ type: 'pestMonths', months: pestMonths, positive: false });
  }
  return { score: (suitableMonths / totalMonths) * weights.climateFit + pestMonths * weights.pestMonth, reasons };
}

export function recommendNextCrops(input: RecommendationInput): CropRecommendation[] {
  const recommendations = input.candidates.map((candidate) => {
    const harvest = harvestMonth(input.sowMonth, cycleLength(candidate));
    const history = historyReasons(candidate, input.lastCrop, input.previousUse, input.candidates);
    const climate = climateReasons(candidate, input, harvest);
    const fitsAltitude = isWithin(input.lotElevationInMeters, candidate.altitudeInMeters);
    const reasons = [...history.reasons, ...climate.reasons];
    if (!fitsAltitude) {
      reasons.push({ type: 'altitudeOutOfRange', positive: false });
    }
    return {
      cropKey: candidate.key,
      score: Math.round((history.score + climate.score) * 10) / 10,
      fitsAltitude,
      sowMonth: input.sowMonth,
      harvestMonth: harvest,
      reasons,
    };
  });
  return recommendations.sort(
    (first, second) => Number(second.fitsAltitude) - Number(first.fitsAltitude) || second.score - first.score,
  );
}
