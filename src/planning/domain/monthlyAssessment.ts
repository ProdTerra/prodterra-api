import { referenceCycleInDays } from '../../catalog/domain/referenceCycle.js';
import type { Range } from '../../catalog/domain/catalogValues.js';
import type { Crop } from '../../catalog/domain/crop.js';
import type { Pest } from '../../catalog/domain/pest.js';
import { pestsThatAffect } from '../../catalog/domain/pestsForCrop.js';
import type { MonthlyClimate } from '../../climate/domain/monthlyClimate.js';

export type AlertLevel = 'watch' | 'risk';
export type MonthStatus = 'ok' | AlertLevel;

export type PlanAlert =
  | { type: 'frost'; level: 'risk'; minimumTemperatureInCelsius: number }
  | { type: 'temperature'; level: 'risk'; meanTemperatureInCelsius: number }
  | { type: 'pest'; level: 'watch'; pestKey: string }
  | { type: 'irrigation'; level: 'watch'; litersPerSquareMeter: number }
  | { type: 'drought'; level: 'risk'; litersPerSquareMeter: number }
  | { type: 'waterExcess'; level: 'watch'; litersPerSquareMeter: number };

export type MonthAssessment = { status: MonthStatus; alerts: PlanAlert[] };

type AssessmentInput = {
  crop: Crop | null;
  pests: Pest[];
  climate: MonthlyClimate;
  hasIrrigation: boolean;
};

const frostThresholdInCelsius = 2;
const daysInMonth = [31, 28.25, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function isWithin(value: number, range: Range): boolean {
  const aboveMinimum = range.minimum === null || value >= range.minimum;
  const belowMaximum = range.maximum === null || value <= range.maximum;
  return aboveMinimum && belowMaximum;
}

type WaterBalance = { deficit: number; excess: number };

function waterBalanceInLitersPerSquareMeter(crop: Crop, climate: MonthlyClimate): WaterBalance {
  const cycleLength = referenceCycleInDays(crop.cycleLengthInDays);
  if (cycleLength === null || cycleLength <= 0) {
    return { deficit: 0, excess: 0 };
  }
  const days = daysInMonth[climate.month - 1];
  const rain = climate.precipitationInMillimetersPerDay * days;
  const monthlyNeed = (needPerCycle: number | null) => (needPerCycle === null ? null : (needPerCycle / cycleLength) * days);
  const minimumNeed = monthlyNeed(crop.waterNeedInMillimetersPerCycle.minimum);
  const maximumNeed = monthlyNeed(crop.waterNeedInMillimetersPerCycle.maximum);
  return {
    deficit: minimumNeed === null ? 0 : Math.max(Math.round(minimumNeed - rain), 0),
    excess: maximumNeed === null ? 0 : Math.max(Math.round(rain - maximumNeed), 0),
  };
}

function fitsCropTemperature(crop: Crop, climate: MonthlyClimate): boolean {
  return isWithin(climate.meanTemperatureInCelsius, crop.temperatureInCelsius);
}

function fitsCropHumidity(crop: Crop, climate: MonthlyClimate): boolean {
  return isWithin(climate.relativeHumidityInPercent, crop.relativeHumidityInPercent);
}

function pestsThreateningCropOutOfRange(crop: Crop, pests: Pest[], climate: MonthlyClimate): Pest[] {
  if (fitsCropTemperature(crop, climate) && fitsCropHumidity(crop, climate)) {
    return [];
  }
  return pestsThatAffect(crop, pests);
}

function cropAlerts(crop: Crop, pests: Pest[], climate: MonthlyClimate, hasIrrigation: boolean): PlanAlert[] {
  const alerts: PlanAlert[] = [];
  if (!fitsCropTemperature(crop, climate)) {
    alerts.push({ type: 'temperature', level: 'risk', meanTemperatureInCelsius: climate.meanTemperatureInCelsius });
  }
  const { deficit, excess } = waterBalanceInLitersPerSquareMeter(crop, climate);
  if (deficit > 0) {
    alerts.push(
      hasIrrigation
        ? { type: 'irrigation', level: 'watch', litersPerSquareMeter: deficit }
        : { type: 'drought', level: 'risk', litersPerSquareMeter: deficit },
    );
  }
  if (excess > 0) {
    alerts.push({ type: 'waterExcess', level: 'watch', litersPerSquareMeter: excess });
  }
  for (const pest of pestsThreateningCropOutOfRange(crop, pests, climate)) {
    alerts.push({ type: 'pest', level: 'watch', pestKey: pest.key });
  }
  return alerts;
}

export function assessMonth({ crop, pests, climate, hasIrrigation }: AssessmentInput): MonthAssessment {
  const alerts: PlanAlert[] = [];
  if (climate.minimumTemperatureInCelsius < frostThresholdInCelsius) {
    alerts.push({ type: 'frost', level: 'risk', minimumTemperatureInCelsius: climate.minimumTemperatureInCelsius });
  }
  if (crop) {
    alerts.push(...cropAlerts(crop, pests, climate, hasIrrigation));
  }
  const status: MonthStatus = alerts.some((alert) => alert.level === 'risk')
    ? 'risk'
    : alerts.length > 0
      ? 'watch'
      : 'ok';
  return { status, alerts };
}
