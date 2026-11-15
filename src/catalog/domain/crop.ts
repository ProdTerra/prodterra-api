import type { LocalizedName, Range, Source } from './catalogValues.js';

export const nutrients = ['N', 'P', 'K', 'Ca', 'Mg', 'S'] as const;
export type Nutrient = (typeof nutrients)[number];

export const demandLevels = ['high', 'medium', 'low'] as const;
export type DemandLevel = (typeof demandLevels)[number];

export type NutrientDemand = {
  nutrient: Nutrient;
  level: DemandLevel;
};

export type Crop = {
  key: string;
  name: LocalizedName;
  scientificName: string;
  familyKey: string;
  demandLevel: DemandLevel;
  nutrients: NutrientDemand[];
  altitudeInMeters: Range;
  latitudeInDegrees: Range;
  temperatureInCelsius: Range;
  waterNeedInMillimetersPerCycle: Range;
  relativeHumidityInPercent: Range;
  solarRadiationInKilowattHoursPerSquareMeterPerDay: Range;
  cycleLengthInDays: Range;
  sources: Source[];
};
