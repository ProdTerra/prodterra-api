import type { Range, Source } from '../domain/catalogValues.js';
import type { Crop, DemandLevel, NutrientDemand } from '../domain/crop.js';
import type { Pest, PestType } from '../domain/pest.js';
import type { PlantFamily } from '../domain/plantFamily.js';

export const demoSourceLabel = 'Dato de prueba ficticio para desarrollo. No usar en producción.';

const demoSource: Source = { label: demoSourceLabel, url: null };

const range = (minimum: number, maximum: number): Range => ({ minimum, maximum });

export const demoFamilies: PlantFamily[] = [
  { key: 'solanaceae', scientificName: 'Solanaceae', name: { es: 'Solanáceas', en: 'Nightshade family' }, sources: [demoSource] },
  { key: 'amaryllidaceae', scientificName: 'Amaryllidaceae', name: { es: 'Amarilidáceas', en: 'Onion family' }, sources: [demoSource] },
  { key: 'apiaceae', scientificName: 'Apiaceae', name: { es: 'Apiáceas', en: 'Carrot family' }, sources: [demoSource] },
  { key: 'brassicaceae', scientificName: 'Brassicaceae', name: { es: 'Brasicáceas', en: 'Cabbage family' }, sources: [demoSource] },
  { key: 'asteraceae', scientificName: 'Asteraceae', name: { es: 'Asteráceas', en: 'Daisy family' }, sources: [demoSource] },
  { key: 'cucurbitaceae', scientificName: 'Cucurbitaceae', name: { es: 'Cucurbitáceas', en: 'Gourd family' }, sources: [demoSource] },
  { key: 'rosaceae', scientificName: 'Rosaceae', name: { es: 'Rosáceas', en: 'Rose family' }, sources: [demoSource] },
];

type DemoCropIdentity = Pick<Crop, 'key' | 'name' | 'scientificName' | 'familyKey'> & { cycleInDays: number };

const demoCropIdentities: DemoCropIdentity[] = [
  { key: 'potato', name: { es: 'Papa', en: 'Potato' }, scientificName: 'Solanum tuberosum', familyKey: 'solanaceae', cycleInDays: 120 },
  { key: 'onion', name: { es: 'Cebolla', en: 'Onion' }, scientificName: 'Allium cepa', familyKey: 'amaryllidaceae', cycleInDays: 120 },
  { key: 'carrot', name: { es: 'Zanahoria', en: 'Carrot' }, scientificName: 'Daucus carota', familyKey: 'apiaceae', cycleInDays: 180 },
  {
    key: 'cabbage',
    name: { es: 'Repollo', en: 'Cabbage' },
    scientificName: 'Brassica oleracea var. capitata',
    familyKey: 'brassicaceae',
    cycleInDays: 112,
  },
  { key: 'lettuce', name: { es: 'Lechuga', en: 'Lettuce' }, scientificName: 'Lactuca sativa', familyKey: 'asteraceae', cycleInDays: 75 },
  { key: 'chayote', name: { es: 'Chayote', en: 'Chayote' }, scientificName: 'Sechium edule', familyKey: 'cucurbitaceae', cycleInDays: 150 },
  { key: 'tomato', name: { es: 'Tomate', en: 'Tomato' }, scientificName: 'Solanum lycopersicum', familyKey: 'solanaceae', cycleInDays: 180 },
  {
    key: 'broccoli',
    name: { es: 'Brócoli', en: 'Broccoli' },
    scientificName: 'Brassica oleracea var. italica',
    familyKey: 'brassicaceae',
    cycleInDays: 112,
  },
  {
    key: 'cauliflower',
    name: { es: 'Coliflor', en: 'Cauliflower' },
    scientificName: 'Brassica oleracea var. botrytis',
    familyKey: 'brassicaceae',
    cycleInDays: 112,
  },
  { key: 'strawberry', name: { es: 'Fresa', en: 'Strawberry' }, scientificName: 'Fragaria × ananassa', familyKey: 'rosaceae', cycleInDays: 150 },
];

type DemoCropValues = {
  demandLevel: DemandLevel;
  nutrients: NutrientDemand[];
  altitudeInMeters: Range;
  temperatureInCelsius: Range;
  waterNeedInMillimetersPerCycle: Range;
  relativeHumidityInPercent: Range;
  solarRadiationInKilowattHoursPerSquareMeterPerDay: Range;
};

const demoValuesByCrop: Record<string, DemoCropValues> = {
  potato: {
    demandLevel: 'high',
    nutrients: [{ nutrient: 'K', level: 'high' }, { nutrient: 'N', level: 'medium' }, { nutrient: 'P', level: 'medium' }],
    altitudeInMeters: range(1500, 3200),
    temperatureInCelsius: range(8, 22),
    waterNeedInMillimetersPerCycle: range(500, 700),
    relativeHumidityInPercent: range(70, 90),
    solarRadiationInKilowattHoursPerSquareMeterPerDay: range(3.5, 6),
  },
  onion: {
    demandLevel: 'medium',
    nutrients: [{ nutrient: 'K', level: 'medium' }, { nutrient: 'N', level: 'medium' }, { nutrient: 'S', level: 'medium' }],
    altitudeInMeters: range(1300, 2400),
    temperatureInCelsius: range(12, 25),
    waterNeedInMillimetersPerCycle: range(350, 550),
    relativeHumidityInPercent: range(60, 80),
    solarRadiationInKilowattHoursPerSquareMeterPerDay: range(4.5, 6.5),
  },
  carrot: {
    demandLevel: 'medium',
    nutrients: [{ nutrient: 'K', level: 'medium' }, { nutrient: 'N', level: 'low' }],
    altitudeInMeters: range(1400, 2800),
    temperatureInCelsius: range(12, 22),
    waterNeedInMillimetersPerCycle: range(350, 550),
    relativeHumidityInPercent: range(65, 85),
    solarRadiationInKilowattHoursPerSquareMeterPerDay: range(4, 6),
  },
  cabbage: {
    demandLevel: 'high',
    nutrients: [{ nutrient: 'N', level: 'high' }, { nutrient: 'K', level: 'high' }, { nutrient: 'Ca', level: 'medium' }],
    altitudeInMeters: range(1200, 3000),
    temperatureInCelsius: range(13, 22),
    waterNeedInMillimetersPerCycle: range(380, 500),
    relativeHumidityInPercent: range(70, 90),
    solarRadiationInKilowattHoursPerSquareMeterPerDay: range(3.5, 5.5),
  },
  lettuce: {
    demandLevel: 'low',
    nutrients: [{ nutrient: 'N', level: 'low' }, { nutrient: 'K', level: 'low' }],
    altitudeInMeters: range(1000, 2800),
    temperatureInCelsius: range(12, 20),
    waterNeedInMillimetersPerCycle: range(250, 350),
    relativeHumidityInPercent: range(60, 80),
    solarRadiationInKilowattHoursPerSquareMeterPerDay: range(3.5, 5.5),
  },
  chayote: {
    demandLevel: 'medium',
    nutrients: [{ nutrient: 'K', level: 'medium' }, { nutrient: 'N', level: 'medium' }],
    altitudeInMeters: range(500, 2000),
    temperatureInCelsius: range(16, 26),
    waterNeedInMillimetersPerCycle: range(1200, 1800),
    relativeHumidityInPercent: range(70, 90),
    solarRadiationInKilowattHoursPerSquareMeterPerDay: range(4, 6),
  },
  tomato: {
    demandLevel: 'high',
    nutrients: [{ nutrient: 'K', level: 'high' }, { nutrient: 'N', level: 'high' }, { nutrient: 'Ca', level: 'medium' }],
    altitudeInMeters: range(0, 2000),
    temperatureInCelsius: range(18, 28),
    waterNeedInMillimetersPerCycle: range(400, 600),
    relativeHumidityInPercent: range(60, 80),
    solarRadiationInKilowattHoursPerSquareMeterPerDay: range(5, 7),
  },
  broccoli: {
    demandLevel: 'high',
    nutrients: [{ nutrient: 'N', level: 'high' }, { nutrient: 'K', level: 'high' }, { nutrient: 'S', level: 'medium' }],
    altitudeInMeters: range(1200, 2800),
    temperatureInCelsius: range(13, 22),
    waterNeedInMillimetersPerCycle: range(400, 500),
    relativeHumidityInPercent: range(70, 90),
    solarRadiationInKilowattHoursPerSquareMeterPerDay: range(3.5, 5.5),
  },
  cauliflower: {
    demandLevel: 'high',
    nutrients: [{ nutrient: 'N', level: 'high' }, { nutrient: 'K', level: 'high' }, { nutrient: 'Ca', level: 'medium' }],
    altitudeInMeters: range(1200, 2800),
    temperatureInCelsius: range(13, 21),
    waterNeedInMillimetersPerCycle: range(400, 500),
    relativeHumidityInPercent: range(70, 90),
    solarRadiationInKilowattHoursPerSquareMeterPerDay: range(3.5, 5.5),
  },
  strawberry: {
    demandLevel: 'medium',
    nutrients: [{ nutrient: 'K', level: 'medium' }, { nutrient: 'N', level: 'medium' }, { nutrient: 'Ca', level: 'low' }],
    altitudeInMeters: range(1200, 2500),
    temperatureInCelsius: range(15, 24),
    waterNeedInMillimetersPerCycle: range(400, 600),
    relativeHumidityInPercent: range(60, 80),
    solarRadiationInKilowattHoursPerSquareMeterPerDay: range(4, 6),
  },
};

export const demoCrops: Crop[] = demoCropIdentities.map(({ cycleInDays, ...identity }) => {
  const values = demoValuesByCrop[identity.key];
  if (!values) {
    throw new Error(`Missing demo values for crop ${identity.key}`);
  }
  return { ...identity, ...values, cycleLengthInDays: range(cycleInDays, cycleInDays), sources: [demoSource] };
});

type DemoPest = {
  key: string;
  es: string;
  en: string;
  scientificName: string;
  type: PestType;
  families: string[];
  onlyCrops?: string[];
};

const demoPestRows: DemoPest[] = [
  { key: 'late-blight', es: 'Tizón tardío', en: 'Late blight', scientificName: 'Phytophthora infestans', type: 'disease', families: ['solanaceae'] },
  { key: 'early-blight', es: 'Tizón temprano', en: 'Early blight', scientificName: 'Alternaria solani', type: 'disease', families: ['solanaceae'] },
  { key: 'guatemalan-potato-moth', es: 'Polilla guatemalteca', en: 'Guatemalan potato moth', scientificName: 'Tecia solanivora', type: 'pest', families: ['solanaceae'], onlyCrops: ['potato'] },
  { key: 'whitefly', es: 'Mosca blanca', en: 'Whitefly', scientificName: 'Bemisia tabaci', type: 'pest', families: ['solanaceae', 'cucurbitaceae'] },
  { key: 'tomato-leafminer', es: 'Polilla del tomate', en: 'Tomato leafminer', scientificName: 'Tuta absoluta', type: 'pest', families: ['solanaceae'], onlyCrops: ['tomato'] },
  { key: 'diamondback-moth', es: 'Polilla dorso de diamante', en: 'Diamondback moth', scientificName: 'Plutella xylostella', type: 'pest', families: ['brassicaceae'] },
  { key: 'clubroot', es: 'Hernia de la col', en: 'Clubroot', scientificName: 'Plasmodiophora brassicae', type: 'disease', families: ['brassicaceae'] },
  { key: 'onion-downy-mildew', es: 'Mildiu de la cebolla', en: 'Onion downy mildew', scientificName: 'Peronospora destructor', type: 'disease', families: ['amaryllidaceae'] },
  { key: 'purple-blotch', es: 'Mancha púrpura', en: 'Purple blotch', scientificName: 'Alternaria porri', type: 'disease', families: ['amaryllidaceae'] },
  { key: 'onion-thrips', es: 'Trips de la cebolla', en: 'Onion thrips', scientificName: 'Thrips tabaci', type: 'pest', families: ['amaryllidaceae', 'brassicaceae'] },
  { key: 'carrot-leaf-blight', es: 'Quemazón de la hoja', en: 'Carrot leaf blight', scientificName: 'Alternaria dauci', type: 'disease', families: ['apiaceae'] },
  { key: 'root-knot-nematode', es: 'Nematodo agallador', en: 'Root-knot nematode', scientificName: 'Meloidogyne spp.', type: 'pest', families: ['solanaceae', 'apiaceae', 'asteraceae', 'cucurbitaceae'] },
  { key: 'green-peach-aphid', es: 'Pulgón verde', en: 'Green peach aphid', scientificName: 'Myzus persicae', type: 'pest', families: ['solanaceae', 'brassicaceae', 'asteraceae'] },
  { key: 'lettuce-downy-mildew', es: 'Mildiu de la lechuga', en: 'Lettuce downy mildew', scientificName: 'Bremia lactucae', type: 'disease', families: ['asteraceae'] },
  { key: 'white-mold', es: 'Moho blanco', en: 'White mold', scientificName: 'Sclerotinia sclerotiorum', type: 'disease', families: ['asteraceae', 'brassicaceae', 'apiaceae'] },
  { key: 'powdery-mildew-cucurbits', es: 'Oídio de las cucurbitáceas', en: 'Cucurbit powdery mildew', scientificName: 'Podosphaera xanthii', type: 'disease', families: ['cucurbitaceae'] },
  { key: 'gray-mold', es: 'Moho gris', en: 'Gray mold', scientificName: 'Botrytis cinerea', type: 'disease', families: ['rosaceae', 'solanaceae', 'asteraceae'] },
  { key: 'two-spotted-spider-mite', es: 'Araña roja', en: 'Two-spotted spider mite', scientificName: 'Tetranychus urticae', type: 'pest', families: ['rosaceae', 'solanaceae', 'cucurbitaceae'] },
];

export const demoPests: Pest[] = demoPestRows.map((row) => ({
  key: row.key,
  name: { es: row.es, en: row.en },
  scientificName: row.scientificName,
  type: row.type,
  affectedFamilyKeys: row.families,
  onlyAffectsCropKeys: row.onlyCrops ?? [],
  sources: [demoSource],
}));
