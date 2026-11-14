import type { LocalizedName, Source } from './catalogValues.js';

export type PlantFamily = {
  key: string;
  scientificName: string;
  name: LocalizedName;
  sources: Source[];
};
