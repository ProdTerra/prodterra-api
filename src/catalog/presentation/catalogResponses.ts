import type { LocalizedName } from '../domain/catalogValues.js';
import type { Pest } from '../domain/pest.js';
import type { PlantFamily } from '../domain/plantFamily.js';

export type LocalizedNameResponse = { es: string; en: string };

export type PestResponse = Omit<Pest, 'name'> & { name: LocalizedNameResponse };

export type FamilyResponse = Omit<PlantFamily, 'name'> & { name: LocalizedNameResponse };

export function toLocalizedNameResponse(name: LocalizedName): LocalizedNameResponse {
  return { es: name.es, en: name.en ?? name.es };
}

export function toPestResponse(pest: Pest): PestResponse {
  return { ...pest, name: toLocalizedNameResponse(pest.name) };
}

export function toFamilyResponse(family: PlantFamily): FamilyResponse {
  return { ...family, name: toLocalizedNameResponse(family.name) };
}
