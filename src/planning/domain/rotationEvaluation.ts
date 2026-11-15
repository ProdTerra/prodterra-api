import type { Crop } from '../../catalog/domain/crop.js';
import type { Pest } from '../../catalog/domain/pest.js';
import { referenceCycleInDays } from '../../catalog/domain/referenceCycle.js';
import type { MonthlyClimate } from '../../climate/domain/monthlyClimate.js';
import { addMonths, monthNumberOf, monthsBetween, type MonthKey } from './monthKeys.js';
import { assessMonth, type MonthAssessment } from './monthlyAssessment.js';
import { recommendNextCrops, type PreviousUse, type RecommendationReason } from './recommendation.js';
import {
  addDays,
  blockOnDate,
  isBefore,
  monthKeyOf,
  scheduleBlocks,
  type IsoDate,
  type RotationBlockInput,
  type ScheduledBlock,
} from './rotationSchedule.js';

export type RotationWarning =
  | { type: 'sameFamilyInARow'; blockIndex: number; familyKey: string }
  | { type: 'shorterThanReference'; blockIndex: number; durationInDays: number; referenceCycleInDays: number }
  | { type: 'altitudeOutOfRange'; blockIndex: number; cropKey: string };

export type EvaluatedMonth = MonthAssessment & { month: MonthKey; cropKey: string | null; isRest: boolean };

export type EvaluatedBlock = ScheduledBlock & { referenceCycleInDays: number | null; reasons: RecommendationReason[] };

export type EvaluatedRotation = { blocks: EvaluatedBlock[]; months: EvaluatedMonth[]; warnings: RotationWarning[] };

export type RotationContext = {
  crops: Crop[];
  pests: Pest[];
  climate: MonthlyClimate[];
  lotElevationInMeters: number;
  hasIrrigation: boolean;
  previousUse: PreviousUse;
};

const shortCycleTolerance = 0.85;
const fallbackCycleInDays = 90;
const daysPerMonth = 30;

function findCrop(crops: Crop[], cropKey: string | null): Crop | null {
  return crops.find((crop) => crop.key === cropKey) ?? null;
}

function isAltitudeOutOfRange(crop: Crop, elevation: number): boolean {
  const { minimum, maximum } = crop.altitudeInMeters;
  return (minimum !== null && elevation < minimum) || (maximum !== null && elevation > maximum);
}

function rotationWarnings(blocks: ScheduledBlock[], context: RotationContext): RotationWarning[] {
  const warnings: RotationWarning[] = [];
  let lastCrop = context.previousUse.kind === 'crop' ? findCrop(context.crops, context.previousUse.cropKey) : null;
  blocks.forEach((block, blockIndex) => {
    const crop = findCrop(context.crops, block.cropKey);
    if (!crop) {
      return;
    }
    if (lastCrop && lastCrop.familyKey === crop.familyKey) {
      warnings.push({ type: 'sameFamilyInARow', blockIndex, familyKey: crop.familyKey });
    }
    const reference = referenceCycleInDays(crop.cycleLengthInDays);
    if (reference !== null && block.durationInDays < reference * shortCycleTolerance) {
      warnings.push({ type: 'shorterThanReference', blockIndex, durationInDays: block.durationInDays, referenceCycleInDays: reference });
    }
    if (isAltitudeOutOfRange(crop, context.lotElevationInMeters)) {
      warnings.push({ type: 'altitudeOutOfRange', blockIndex, cropKey: crop.key });
    }
    lastCrop = crop;
  });
  return warnings;
}

function evaluateMonths(blocks: ScheduledBlock[], context: RotationContext): EvaluatedMonth[] {
  if (blocks.length === 0) {
    return [];
  }
  const firstMonth = monthKeyOf(blocks[0].startsOn);
  const lastMonth = monthKeyOf(blocks[blocks.length - 1].endsOn);
  return Array.from({ length: monthsBetween(firstMonth, lastMonth) + 1 }, (_, offset) => {
    const month = addMonths(firstMonth, offset);
    const block = blockOnDate(blocks, `${month}-15`);
    const crop = findCrop(context.crops, block?.cropKey ?? null);
    const assessment = assessMonth({
      crop,
      pests: context.pests,
      climate: context.climate[monthNumberOf(month) - 1],
      hasIrrigation: context.hasIrrigation,
    });
    return { ...assessment, month, cropKey: crop?.key ?? null, isRest: block?.kind === 'rest' };
  });
}

function withReferences(blocks: ScheduledBlock[], crops: Crop[], reasons: RecommendationReason[][] = []): EvaluatedBlock[] {
  return blocks.map((block, index) => {
    const crop = findCrop(crops, block.cropKey);
    return {
      ...block,
      referenceCycleInDays: crop ? referenceCycleInDays(crop.cycleLengthInDays) : null,
      reasons: reasons[index] ?? [],
    };
  });
}

export function evaluateRotation(startDate: IsoDate, inputs: RotationBlockInput[], context: RotationContext): EvaluatedRotation {
  const blocks = scheduleBlocks(startDate, inputs);
  return {
    blocks: withReferences(blocks, context.crops),
    months: evaluateMonths(blocks, context),
    warnings: rotationWarnings(blocks, context),
  };
}

export function recommendRotation(startDate: IsoDate, endDate: IsoDate, context: RotationContext): EvaluatedRotation {
  const inputs: RotationBlockInput[] = [];
  const reasons: RecommendationReason[][] = [];
  let cursor = startDate;
  let lastCrop = context.previousUse.kind === 'crop' ? findCrop(context.crops, context.previousUse.cropKey) : null;
  let previousUse = context.previousUse;
  while (isBefore(cursor, endDate)) {
    const [best] = recommendNextCrops({
      candidates: context.crops,
      pests: context.pests,
      climate: context.climate,
      lotElevationInMeters: context.lotElevationInMeters,
      sowMonth: monthKeyOf(cursor),
      hasIrrigation: context.hasIrrigation,
      lastCrop,
      previousUse,
    });
    const crop = best ? findCrop(context.crops, best.cropKey) : null;
    if (!best || !crop) {
      break;
    }
    const delayInMonths = monthsBetween(monthKeyOf(cursor), best.sowMonth);
    if (delayInMonths > 0) {
      inputs.push({ kind: 'rest', durationInDays: delayInMonths * daysPerMonth });
      reasons.push([]);
      cursor = addDays(cursor, delayInMonths * daysPerMonth);
    }
    const duration = referenceCycleInDays(crop.cycleLengthInDays) ?? fallbackCycleInDays;
    inputs.push({ kind: 'crop', cropKey: crop.key, durationInDays: duration });
    reasons.push(best.reasons);
    cursor = addDays(cursor, duration);
    lastCrop = crop;
    previousUse = { kind: 'crop', cropKey: crop.key };
  }
  const blocks = scheduleBlocks(startDate, inputs);
  return {
    blocks: withReferences(blocks, context.crops, reasons),
    months: evaluateMonths(blocks, context),
    warnings: rotationWarnings(blocks, context),
  };
}
