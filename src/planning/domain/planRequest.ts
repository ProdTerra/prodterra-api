import { isLotBoundary, type LotBoundary } from '../../climate/domain/lotBoundary.js';
import type { CurrentUse } from './lotPlan.js';
import type { MonthKey } from './monthKeys.js';
import type { PreviousUse } from './recommendation.js';

export type LotPlanRequest = {
  lotId: string;
  boundary: LotBoundary;
  currentUse: CurrentUse;
  previousUse: PreviousUse;
  hasIrrigation: boolean;
};

export type PlanRequest = {
  startMonth: MonthKey;
  horizonInMonths: number;
  lots: LotPlanRequest[];
};

export type ParsedPlanRequest = { valid: true; request: PlanRequest } | { valid: false; error: string };

const maximumLots = 30;
const defaultHorizonInMonths = 12;
const maximumHorizonInMonths = 24;
const monthPattern = /^\d{4}-(0[1-9]|1[0-2])$/;
const keyPattern = /^[a-z0-9-]{1,40}$/;

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function isMonth(value: unknown): value is MonthKey {
  return typeof value === 'string' && monthPattern.test(value);
}

function isCurrentUse(value: unknown): value is CurrentUse {
  if (!isRecord(value)) {
    return false;
  }
  if (value.kind === 'fallow') {
    return true;
  }
  return value.kind === 'crop' && typeof value.cropKey === 'string' && keyPattern.test(value.cropKey) && isMonth(value.plantedOn);
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

function isLotPlanRequest(value: unknown): value is LotPlanRequest {
  return (
    isRecord(value) &&
    typeof value.lotId === 'string' &&
    value.lotId.length > 0 &&
    value.lotId.length <= 64 &&
    isLotBoundary(value.boundary) &&
    isCurrentUse(value.currentUse) &&
    isPreviousUse(value.previousUse) &&
    typeof value.hasIrrigation === 'boolean'
  );
}

function currentMonth(today: Date): MonthKey {
  return `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function parsePlanRequest(body: unknown, today: Date): ParsedPlanRequest {
  if (!isRecord(body) || !Array.isArray(body.lots) || body.lots.length === 0 || body.lots.length > maximumLots) {
    return { valid: false, error: `lots must contain between 1 and ${maximumLots} lots` };
  }
  const invalidIndex = body.lots.findIndex((lot) => !isLotPlanRequest(lot));
  if (invalidIndex >= 0) {
    return { valid: false, error: `lots[${invalidIndex}] is not a valid lot with boundary, currentUse, previousUse and hasIrrigation` };
  }
  const horizon = body.horizonInMonths ?? defaultHorizonInMonths;
  if (typeof horizon !== 'number' || !Number.isInteger(horizon) || horizon < 1 || horizon > maximumHorizonInMonths) {
    return { valid: false, error: `horizonInMonths must be an integer between 1 and ${maximumHorizonInMonths}` };
  }
  const startMonth = body.startMonth ?? currentMonth(today);
  if (!isMonth(startMonth)) {
    return { valid: false, error: 'startMonth must look like YYYY-MM' };
  }
  return { valid: true, request: { startMonth, horizonInMonths: horizon, lots: body.lots as LotPlanRequest[] } };
}
