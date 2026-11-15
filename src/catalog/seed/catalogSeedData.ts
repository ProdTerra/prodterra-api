import type { Range, Source } from '../domain/catalogValues.js';
import type { Crop, DemandLevel, NutrientDemand } from '../domain/crop.js';
import type { PlantFamily } from '../domain/plantFamily.js';

const unknownRange: Range = { minimum: null, maximum: null };

const gbifSource = (scientificName: string): Source => ({
  label: `GBIF Backbone Taxonomy: ${scientificName}`,
  url: `https://www.gbif.org/species/search?q=${encodeURIComponent(scientificName)}`,
});

const nutrientUptakeSource: Source = {
  label: 'Bertsch, F. Absorción de nutrimentos por los cultivos. Asociación Costarricense de la Ciencia del Suelo',
  url: null,
};

const costModelSource = (label: string, path: string): Source => ({
  label: `MAG/SEPSA, modelo de costos de producción 2025: ${label}`,
  url: `https://www.infoagro.go.cr/wp-content/uploads/2025/${path}`,
});

export const seedFamilies: PlantFamily[] = [
  { key: 'solanaceae', scientificName: 'Solanaceae', name: { es: 'Solanáceas', en: 'Nightshade family' }, sources: [gbifSource('Solanaceae')] },
  { key: 'amaryllidaceae', scientificName: 'Amaryllidaceae', name: { es: 'Amarilidáceas', en: 'Onion family' }, sources: [gbifSource('Amaryllidaceae')] },
  { key: 'apiaceae', scientificName: 'Apiaceae', name: { es: 'Apiáceas', en: 'Carrot family' }, sources: [gbifSource('Apiaceae')] },
  { key: 'brassicaceae', scientificName: 'Brassicaceae', name: { es: 'Brasicáceas', en: 'Cabbage family' }, sources: [gbifSource('Brassicaceae')] },
  { key: 'asteraceae', scientificName: 'Asteraceae', name: { es: 'Asteráceas', en: 'Daisy family' }, sources: [gbifSource('Asteraceae')] },
  { key: 'cucurbitaceae', scientificName: 'Cucurbitaceae', name: { es: 'Cucurbitáceas', en: 'Gourd family' }, sources: [gbifSource('Cucurbitaceae')] },
  { key: 'rosaceae', scientificName: 'Rosaceae', name: { es: 'Rosáceas', en: 'Rose family' }, sources: [gbifSource('Rosaceae')] },
];

type CropSeed = {
  key: string;
  name: Crop['name'];
  scientificName: string;
  familyKey: string;
  demandLevel: DemandLevel | null;
  nutrients: NutrientDemand[];
  cycleLengthInDays: Range;
  cycleSources: Source[];
};

function toCrop({ cycleSources, ...seed }: CropSeed): Crop {
  const nutrientSources = seed.nutrients.length > 0 ? [nutrientUptakeSource] : [];
  return {
    ...seed,
    altitudeInMeters: unknownRange,
    latitudeInDegrees: unknownRange,
    temperatureInCelsius: unknownRange,
    waterNeedInMillimetersPerCycle: unknownRange,
    relativeHumidityInPercent: unknownRange,
    solarRadiationInKilowattHoursPerSquareMeterPerDay: unknownRange,
    sources: [gbifSource(seed.scientificName), ...nutrientSources, ...cycleSources],
  };
}

const fourMonths: Range = { minimum: 120, maximum: 120 };
const sixteenWeeks: Range = { minimum: 112, maximum: 112 };

const cropSeeds: CropSeed[] = [
  {
    key: 'potato',
    name: { es: 'Papa', en: 'Potato' },
    scientificName: 'Solanum tuberosum',
    familyKey: 'solanaceae',
    demandLevel: 'high',
    nutrients: [{ nutrient: 'K', level: 'high' }, { nutrient: 'N', level: 'medium' }],
    cycleLengthInDays: fourMonths,
    cycleSources: [costModelSource('papa, Zona Norte de Cartago (ciclo de 4 meses)', '07/PAPA_CentralOriental_2025.pdf')],
  },
  {
    key: 'onion',
    name: { es: 'Cebolla', en: 'Onion' },
    scientificName: 'Allium cepa',
    familyKey: 'amaryllidaceae',
    demandLevel: 'medium',
    nutrients: [{ nutrient: 'K', level: 'medium' }, { nutrient: 'N', level: 'medium' }],
    cycleLengthInDays: fourMonths,
    cycleSources: [
      costModelSource('cebolla, Central Oriental - Cartago (4 meses en campo, más 2 meses de almácigo)', '07/CEBOLLA_CentralOriental_2025.pdf'),
    ],
  },
  {
    key: 'carrot',
    name: { es: 'Zanahoria', en: 'Carrot' },
    scientificName: 'Daucus carota',
    familyKey: 'apiaceae',
    demandLevel: 'medium',
    nutrients: [{ nutrient: 'K', level: 'medium' }],
    cycleLengthInDays: { minimum: 180, maximum: 180 },
    cycleSources: [costModelSource('zanahoria, Zona Norte de Cartago (ciclo de 6 meses)', '04/ZANAHORIA_CentralOriental_2025.pdf')],
  },
  {
    key: 'cabbage',
    name: { es: 'Repollo', en: 'Cabbage' },
    scientificName: 'Brassica oleracea var. capitata',
    familyKey: 'brassicaceae',
    demandLevel: 'high',
    nutrients: [{ nutrient: 'N', level: 'high' }, { nutrient: 'K', level: 'high' }],
    cycleLengthInDays: sixteenWeeks,
    cycleSources: [costModelSource('repollo, Región Central Oriental (16 semanas)', '08/REPOLLO_CentralOriental_2025.pdf')],
  },
  {
    key: 'lettuce',
    name: { es: 'Lechuga', en: 'Lettuce' },
    scientificName: 'Lactuca sativa',
    familyKey: 'asteraceae',
    demandLevel: 'low',
    nutrients: [{ nutrient: 'N', level: 'low' }],
    cycleLengthInDays: unknownRange,
    cycleSources: [],
  },
  {
    key: 'chayote',
    name: { es: 'Chayote', en: 'Chayote' },
    scientificName: 'Sechium edule',
    familyKey: 'cucurbitaceae',
    demandLevel: null,
    nutrients: [],
    cycleLengthInDays: unknownRange,
    cycleSources: [],
  },
  {
    key: 'tomato',
    name: { es: 'Tomate', en: 'Tomato' },
    scientificName: 'Solanum lycopersicum',
    familyKey: 'solanaceae',
    demandLevel: null,
    nutrients: [],
    cycleLengthInDays: { minimum: 180, maximum: 180 },
    cycleSources: [
      costModelSource('tomate, Santa Bárbara de Heredia, Central Occidental (ciclo de 6 meses)', '03/TOMATE_CentralOccidental_veranera_2025.pdf'),
    ],
  },
  {
    key: 'broccoli',
    name: { es: 'Brócoli', en: 'Broccoli' },
    scientificName: 'Brassica oleracea var. italica',
    familyKey: 'brassicaceae',
    demandLevel: 'high',
    nutrients: [{ nutrient: 'N', level: 'high' }, { nutrient: 'K', level: 'high' }],
    cycleLengthInDays: sixteenWeeks,
    cycleSources: [costModelSource('brócoli, Región Central Oriental (16 semanas)', '08/BROCOLI_CentralOriental_2025.pdf')],
  },
  {
    key: 'cauliflower',
    name: { es: 'Coliflor', en: 'Cauliflower' },
    scientificName: 'Brassica oleracea var. botrytis',
    familyKey: 'brassicaceae',
    demandLevel: null,
    nutrients: [],
    cycleLengthInDays: sixteenWeeks,
    cycleSources: [costModelSource('coliflor, Región Central Oriental (16 semanas)', '08/COLIFLOR_CentralOriental_2025.pdf')],
  },
  {
    key: 'strawberry',
    name: { es: 'Fresa', en: 'Strawberry' },
    scientificName: 'Fragaria × ananassa',
    familyKey: 'rosaceae',
    demandLevel: null,
    nutrients: [],
    cycleLengthInDays: { minimum: 150, maximum: 150 },
    cycleSources: [
      costModelSource('fresa, Poás de Alajuela, Central Occidental (ciclo de 5 meses; la plantación produce hasta 1,3 años)', '03/FRESA_CentralOccidental_2025.pdf'),
    ],
  },
];

export const seedCrops: Crop[] = cropSeeds.map(toCrop);
