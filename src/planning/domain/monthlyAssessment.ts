import { referenceCycleInDays } from '../../catalog/domain/referenceCycle.js';
import type { Range } from '../../catalog/domain/catalogValues.js';
import type { Crop } from '../../catalog/domain/crop.js';
import type { Pest } from '../../catalog/domain/pest.js';
import type { MonthlyClimate } from '../../climate/domain/monthlyClimate.js';

export type AlertLevel = 'watch' | 'risk';
export type MonthStatus = 'ok' | AlertLevel;

export type PlanAlert =
  | { type: 'frost'; level: 'risk'; minimumTemperatureInCelsius: number }
  | { type: 'temperature'; level: 'risk'; meanTemperatureInCelsius: number }
  | { type: 'pest'; level: 'watch'; pestKey: string }
  | { type: 'irrigation'; level: 'watch'; litersPerSquareMeter: number }
  | { type: 'drought'; level: 'risk'; litersPerSquareMeter: number };

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

function midpoint(range: Range): number | null {
  if (range.minimum === null || range.maximum === null) {
    return range.minimum ?? range.maximum;
  }
  return (range.minimum + range.maximum) / 2;
}

function waterDeficitInLitersPerSquareMeter(crop: Crop, climate: MonthlyClimate): number {
  const waterNeed = midpoint(crop.waterNeedInMillimetersPerCycle);
  const cycleLength = referenceCycleInDays(crop.cycleLengthInDays);
  if (waterNeed === null || cycleLength === null || cycleLength <= 0) {
    return 0;
  }
  const days = daysInMonth[climate.month - 1];
  const need = (waterNeed / cycleLength) * days;
  const rain = climate.precipitationInMillimetersPerDay * days;
  return Math.max(Math.round(need - rain), 0);
}

function pestsActiveFor(crop: Crop, pests: Pest[], climate: MonthlyClimate): Pest[] {
  return pests.filter((pest) => {
    const attacksCrop =
      pest.affectedFamilyKeys.includes(crop.familyKey) &&
      (pest.onlyAffectsCropKeys.length === 0 || pest.onlyAffectsCropKeys.includes(crop.key));
    return (
      attacksCrop &&
      isWithin(climate.meanTemperatureInCelsius, pest.temperatureInCelsius) &&
      isWithin(climate.relativeHumidityInPercent, pest.relativeHumidityInPercent)
    );
  });
}

function cropAlerts(crop: Crop, pests: Pest[], climate: MonthlyClimate, hasIrrigation: boolean): PlanAlert[] {
  const alerts: PlanAlert[] = [];
  if (!isWithin(climate.meanTemperatureInCelsius, crop.temperatureInCelsius)) {
    alerts.push({ type: 'temperature', level: 'risk', meanTemperatureInCelsius: climate.meanTemperatureInCelsius });
  }
  const deficit = waterDeficitInLitersPerSquareMeter(crop, climate);
  if (deficit > 0) {
    alerts.push(
      hasIrrigation
        ? { type: 'irrigation', level: 'watch', litersPerSquareMeter: deficit }
        : { type: 'drought', level: 'risk', litersPerSquareMeter: deficit },
    );
  }
  for (const pest of pestsActiveFor(crop, pests, climate)) {
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
