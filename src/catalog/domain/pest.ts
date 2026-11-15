import type { LocalizedName, Source } from './catalogValues.js';

export const pestTypes = ['disease', 'pest'] as const;
export type PestType = (typeof pestTypes)[number];

export type Pest = {
  key: string;
  name: LocalizedName;
  scientificName: string | null;
  type: PestType;
  affectedFamilyKeys: string[];
  onlyAffectsCropKeys: string[];
  sources: Source[];
};
