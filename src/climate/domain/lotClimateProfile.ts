import type { MonthlyClimate } from './monthlyClimate.js';

export type LotClimateProfile = {
  elevation: {
    meanInMeters: number;
    minimumInMeters: number;
    maximumInMeters: number;
    source: 'NASADEM';
  };
  climateGridElevationInMeters: number;
  temperatureCorrectionInCelsius: number;
  climateSource: string;
  months: MonthlyClimate[];
};
