import { isLotBoundary, type LotBoundary } from '../../climate/domain/lotBoundary.js';
import type { PreviousUse } from './recommendation.js';
import type { IsoDate, RotationBlockInput } from './rotationSchedule.js';

export type LotRotationRequest = {
  lotId: string;
  boundary: LotBoundary;
  previousUse: PreviousUse;
  hasIrrigation: boolean;
  blocks: RotationBlockInput[];
};

export type RotationEvaluationRequest = { startDate: IsoDate; lots: LotRotationRequest[] };

export type ParsedRotationEvaluationRequest =
  | { valid: true; request: RotationEvaluationRequest }
  | { valid: false; error: string };

const maximumLots = 30;
const minimumBlockDays = 14;
const maximumPlanDays = 730;
const maximumStartDaysAhead = 365;
const millisecondsPerDay = 86_400_000;
const datePattern = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const keyPattern = /^[a-z0-9-]{1,40}$/;

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function isPreviousUse(value: unknown): value is PreviousUse {
  if (!isRecord(value)) {
    return false;
  }
  if (value.kind === 'fallow' || value.kind === 'unknown') {
    return true;
  }
  return value.kind === 'crop' && typeof value.cropKey === 'string' && keyPattern.test(value.cropKey);
}

function isBlock(value: unknown): value is RotationBlockInput {
  if (!isRecord(value) || typeof value.durationInDays !== 'number' || !Number.isInteger(value.durationInDays)) {
    return false;
  }
  if (value.durationInDays < minimumBlockDays || value.durationInDays > maximumPlanDays) {
    return false;
  }
  return value.kind === 'rest' || (value.kind === 'crop' && typeof value.cropKey === 'string' && keyPattern.test(value.cropKey));
}

function isLotRotation(value: unknown): value is LotRotationRequest {
  if (!isRecord(value) || !Array.isArray(value.blocks) || value.blocks.length === 0 || !value.blocks.every(isBlock)) {
    return false;
  }
  const totalDays = (value.blocks as RotationBlockInput[]).reduce((sum, block) => sum + block.durationInDays, 0);
  return (
    typeof value.lotId === 'string' &&
    value.lotId.length > 0 &&
    value.lotId.length <= 64 &&
    isLotBoundary(value.boundary) &&
    isPreviousUse(value.previousUse) &&
    typeof value.hasIrrigation === 'boolean' &&
    totalDays <= maximumPlanDays
  );
}

function daysFromToday(date: IsoDate, today: Date): number {
  const todayStart = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return Math.round((Date.parse(`${date}T00:00:00Z`) - todayStart) / millisecondsPerDay);
}

export function parseRotationEvaluationRequest(body: unknown, today: Date): ParsedRotationEvaluationRequest {
  if (!isRecord(body) || typeof body.startDate !== 'string' || !datePattern.test(body.startDate)) {
    return { valid: false, error: 'startDate must look like YYYY-MM-DD' };
  }
  const daysAhead = daysFromToday(body.startDate, today);
  if (Number.isNaN(daysAhead) || daysAhead < -1 || daysAhead > maximumStartDaysAhead) {
    return { valid: false, error: `startDate must be between today and ${maximumStartDaysAhead} days ahead` };
  }
  if (!Array.isArray(body.lots) || body.lots.length === 0 || body.lots.length > maximumLots) {
    return { valid: false, error: `lots must contain between 1 and ${maximumLots} lots` };
  }
  const invalidIndex = body.lots.findIndex((lot) => !isLotRotation(lot));
  if (invalidIndex >= 0) {
    return {
      valid: false,
      error: `lots[${invalidIndex}] needs a boundary, previousUse, hasIrrigation and 1+ blocks of ${minimumBlockDays}-${maximumPlanDays} days (${maximumPlanDays} days in total at most)`,
    };
  }
  return { valid: true, request: { startDate: body.startDate, lots: body.lots as LotRotationRequest[] } };
}
