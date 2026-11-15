import type { LocalizedName, Range, Source } from './catalogValues.js';

export const pestTypes = ['insect', 'mite', 'fungus', 'oomycete', 'bacterium', 'virus', 'nematode', 'other'] as const;
export type PestType = (typeof pestTypes)[number];

export type Pest = {
  key: string;
  name: LocalizedName;
  scientificName: string;
  type: PestType;
  temperatureInCelsius: Range;
  relativeHumidityInPercent: Range;
  affectedFamilyKeys: string[];
  onlyAffectsCropKeys: string[];
  sources: Source[];
};
