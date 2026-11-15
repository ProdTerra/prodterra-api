import type { Source } from '../domain/catalogValues.js';
import type { Crop, DemandLevel, NutrientDemand } from '../domain/crop.js';
import type { PlantFamily } from '../domain/plantFamily.js';

const unknownRange = { minimum: null, maximum: null };

const gbifSource = (scientificName: string): Source => ({
  label: `GBIF Backbone Taxonomy: ${scientificName}`,
  url: `https://www.gbif.org/species/search?q=${encodeURIComponent(scientificName)}`,
});

const nutrientUptakeSource: Source = {
  label: 'Bertsch, F. Absorción de nutrimentos por los cultivos. Asociación Costarricense de la Ciencia del Suelo',
  url: null,
};

export const seedFamilies: PlantFamily[] = [
  { key: 'solanaceae', scientificName: 'Solanaceae', name: { es: 'Solanáceas', en: 'Nightshade family' }, sources: [gbifSource('Solanaceae')] },
  { key: 'brassicaceae', scientificName: 'Brassicaceae', name: { es: 'Brasicáceas', en: 'Cabbage family' }, sources: [gbifSource('Brassicaceae')] },
  { key: 'apiaceae', scientificName: 'Apiaceae', name: { es: 'Apiáceas', en: 'Carrot family' }, sources: [gbifSource('Apiaceae')] },
  { key: 'amaryllidaceae', scientificName: 'Amaryllidaceae', name: { es: 'Amarilidáceas', en: 'Onion family' }, sources: [gbifSource('Amaryllidaceae')] },
  { key: 'asteraceae', scientificName: 'Asteraceae', name: { es: 'Asteráceas', en: 'Daisy family' }, sources: [gbifSource('Asteraceae')] },
];

type CropSeed = {
  key: string;
  name: Crop['name'];
  scientificName: string;
  familyKey: string;
  demandLevel: DemandLevel;
  nutrients: NutrientDemand[];
};

function toCrop(seed: CropSeed): Crop {
  return {
    ...seed,
    altitudeInMeters: unknownRange,
    latitudeInDegrees: unknownRange,
    temperatureInCelsius: unknownRange,
    waterNeedInMillimetersPerCycle: unknownRange,
    relativeHumidityInPercent: unknownRange,
    solarRadiationInKilowattHoursPerSquareMeterPerDay: unknownRange,
    cycleLengthInDays: unknownRange,
    sources: [gbifSource(seed.scientificName), nutrientUptakeSource],
  };
}

const cropSeeds: CropSeed[] = [
  { key: 'potato', name: { es: 'Papa', en: 'Potato' }, scientificName: 'Solanum tuberosum', familyKey: 'solanaceae', demandLevel: 'high', nutrients: [{ nutrient: 'K', level: 'high' }, { nutrient: 'N', level: 'medium' }] },
  { key: 'cabbage', name: { es: 'Repollo', en: 'Cabbage' }, scientificName: 'Brassica oleracea var. capitata', familyKey: 'brassicaceae', demandLevel: 'high', nutrients: [{ nutrient: 'N', level: 'high' }, { nutrient: 'K', level: 'high' }] },
  { key: 'broccoli', name: { es: 'Brócoli', en: 'Broccoli' }, scientificName: 'Brassica oleracea var. italica', familyKey: 'brassicaceae', demandLevel: 'high', nutrients: [{ nutrient: 'N', level: 'high' }, { nutrient: 'K', level: 'high' }] },
  { key: 'carrot', name: { es: 'Zanahoria', en: 'Carrot' }, scientificName: 'Daucus carota', familyKey: 'apiaceae', demandLevel: 'medium', nutrients: [{ nutrient: 'K', level: 'medium' }] },
  { key: 'onion', name: { es: 'Cebolla', en: 'Onion' }, scientificName: 'Allium cepa', familyKey: 'amaryllidaceae', demandLevel: 'medium', nutrients: [{ nutrient: 'K', level: 'medium' }, { nutrient: 'N', level: 'medium' }] },
  { key: 'lettuce', name: { es: 'Lechuga', en: 'Lettuce' }, scientificName: 'Lactuca sativa', familyKey: 'asteraceae', demandLevel: 'low', nutrients: [{ nutrient: 'N', level: 'low' }] },
];

export const seedCrops: Crop[] = cropSeeds.map(toCrop);
