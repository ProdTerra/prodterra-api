import type { MonthlyClimate } from './monthlyClimate.js';

const lapseRateInCelsiusPerMeter = 6.5 / 1000;

function roundToTenth(value: number): number {
  return Math.round(value * 10) / 10;
}

export function temperatureCorrectionInCelsius(
  climateGridElevationInMeters: number,
  lotElevationInMeters: number,
): number {
  return (climateGridElevationInMeters - lotElevationInMeters) * lapseRateInCelsiusPerMeter;
}

export function correctMonthForAltitude(month: MonthlyClimate, correctionInCelsius: number): MonthlyClimate {
  return {
    ...month,
    meanTemperatureInCelsius: roundToTenth(month.meanTemperatureInCelsius + correctionInCelsius),
    minimumTemperatureInCelsius: roundToTenth(month.minimumTemperatureInCelsius + correctionInCelsius),
    maximumTemperatureInCelsius: roundToTenth(month.maximumTemperatureInCelsius + correctionInCelsius),
  };
}
