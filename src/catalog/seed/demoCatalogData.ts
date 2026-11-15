import type { Range, Source } from '../domain/catalogValues.js';
import type { Crop, DemandLevel, NutrientDemand } from '../domain/crop.js';
import type { Pest, PestType } from '../domain/pest.js';
import { seedCrops } from './catalogSeedData.js';

export const demoSourceLabel = 'Dato de prueba ficticio para desarrollo. No usar en producción.';

const demoSource: Source = { label: demoSourceLabel, url: null };

const range = (minimum: number, maximum: number): Range => ({ minimum, maximum });

type DemoCropValues = {
  demandLevel: DemandLevel;
  nutrients: NutrientDemand[];
  altitudeInMeters: Range;
  latitudeInDegrees: Range;
  temperatureInCelsius: Range;
  waterNeedInMillimetersPerCycle: Range;
  relativeHumidityInPercent: Range;
  solarRadiationInKilowattHoursPerSquareMeterPerDay: Range;
  cycleLengthInDays: Range;
};

const demoValuesByCrop: Record<string, DemoCropValues> = {
  potato: {
    demandLevel: 'high',
    nutrients: [{ nutrient: 'K', level: 'high' }, { nutrient: 'N', level: 'medium' }, { nutrient: 'P', level: 'medium' }],
    altitudeInMeters: range(1500, 3200),
    latitudeInDegrees: range(-45, 60),
    temperatureInCelsius: range(8, 22),
    waterNeedInMillimetersPerCycle: range(500, 700),
    relativeHumidityInPercent: range(70, 90),
    solarRadiationInKilowattHoursPerSquareMeterPerDay: range(3.5, 6),
    cycleLengthInDays: range(100, 140),
  },
  onion: {
    demandLevel: 'medium',
    nutrients: [{ nutrient: 'K', level: 'medium' }, { nutrient: 'N', level: 'medium' }, { nutrient: 'S', level: 'medium' }],
    altitudeInMeters: range(1300, 2400),
    latitudeInDegrees: range(-40, 50),
    temperatureInCelsius: range(12, 25),
    waterNeedInMillimetersPerCycle: range(350, 550),
    relativeHumidityInPercent: range(60, 80),
    solarRadiationInKilowattHoursPerSquareMeterPerDay: range(4.5, 6.5),
    cycleLengthInDays: range(120, 180),
  },
  carrot: {
    demandLevel: 'medium',
    nutrients: [{ nutrient: 'K', level: 'medium' }, { nutrient: 'N', level: 'low' }],
    altitudeInMeters: range(1400, 2800),
    latitudeInDegrees: range(-45, 60),
    temperatureInCelsius: range(12, 22),
    waterNeedInMillimetersPerCycle: range(350, 550),
    relativeHumidityInPercent: range(65, 85),
    solarRadiationInKilowattHoursPerSquareMeterPerDay: range(4, 6),
    cycleLengthInDays: range(110, 180),
  },
  cabbage: {
    demandLevel: 'high',
    nutrients: [{ nutrient: 'N', level: 'high' }, { nutrient: 'K', level: 'high' }, { nutrient: 'Ca', level: 'medium' }],
    altitudeInMeters: range(1200, 3000),
    latitudeInDegrees: range(-45, 60),
    temperatureInCelsius: range(13, 22),
    waterNeedInMillimetersPerCycle: range(380, 500),
    relativeHumidityInPercent: range(70, 90),
    solarRadiationInKilowattHoursPerSquareMeterPerDay: range(3.5, 5.5),
    cycleLengthInDays: range(90, 120),
  },
  lettuce: {
    demandLevel: 'low',
    nutrients: [{ nutrient: 'N', level: 'low' }, { nutrient: 'K', level: 'low' }],
    altitudeInMeters: range(1000, 2800),
    latitudeInDegrees: range(-45, 60),
    temperatureInCelsius: range(12, 20),
    waterNeedInMillimetersPerCycle: range(250, 350),
    relativeHumidityInPercent: range(60, 80),
    solarRadiationInKilowattHoursPerSquareMeterPerDay: range(3.5, 5.5),
    cycleLengthInDays: range(60, 90),
  },
  chayote: {
    demandLevel: 'medium',
    nutrients: [{ nutrient: 'K', level: 'medium' }, { nutrient: 'N', level: 'medium' }],
    altitudeInMeters: range(500, 2000),
    latitudeInDegrees: range(-30, 30),
    temperatureInCelsius: range(16, 26),
    waterNeedInMillimetersPerCycle: range(1200, 1800),
    relativeHumidityInPercent: range(70, 90),
    solarRadiationInKilowattHoursPerSquareMeterPerDay: range(4, 6),
    cycleLengthInDays: range(120, 180),
  },
  tomato: {
    demandLevel: 'high',
    nutrients: [{ nutrient: 'K', level: 'high' }, { nutrient: 'N', level: 'high' }, { nutrient: 'Ca', level: 'medium' }],
    altitudeInMeters: range(0, 2000),
    latitudeInDegrees: range(-40, 50),
    temperatureInCelsius: range(18, 28),
    waterNeedInMillimetersPerCycle: range(400, 600),
    relativeHumidityInPercent: range(60, 80),
    solarRadiationInKilowattHoursPerSquareMeterPerDay: range(5, 7),
    cycleLengthInDays: range(120, 150),
  },
  broccoli: {
    demandLevel: 'high',
    nutrients: [{ nutrient: 'N', level: 'high' }, { nutrient: 'K', level: 'high' }, { nutrient: 'S', level: 'medium' }],
    altitudeInMeters: range(1200, 2800),
    latitudeInDegrees: range(-45, 60),
    temperatureInCelsius: range(13, 22),
    waterNeedInMillimetersPerCycle: range(400, 500),
    relativeHumidityInPercent: range(70, 90),
    solarRadiationInKilowattHoursPerSquareMeterPerDay: range(3.5, 5.5),
    cycleLengthInDays: range(100, 120),
  },
  cauliflower: {
    demandLevel: 'high',
    nutrients: [{ nutrient: 'N', level: 'high' }, { nutrient: 'K', level: 'high' }, { nutrient: 'Ca', level: 'medium' }],
    altitudeInMeters: range(1200, 2800),
    latitudeInDegrees: range(-45, 60),
    temperatureInCelsius: range(13, 21),
    waterNeedInMillimetersPerCycle: range(400, 500),
    relativeHumidityInPercent: range(70, 90),
    solarRadiationInKilowattHoursPerSquareMeterPerDay: range(3.5, 5.5),
    cycleLengthInDays: range(100, 120),
  },
  strawberry: {
    demandLevel: 'medium',
    nutrients: [{ nutrient: 'K', level: 'medium' }, { nutrient: 'N', level: 'medium' }, { nutrient: 'Ca', level: 'low' }],
    altitudeInMeters: range(1200, 2500),
    latitudeInDegrees: range(-40, 55),
    temperatureInCelsius: range(15, 24),
    waterNeedInMillimetersPerCycle: range(400, 600),
    relativeHumidityInPercent: range(60, 80),
    solarRadiationInKilowattHoursPerSquareMeterPerDay: range(4, 6),
    cycleLengthInDays: range(90, 150),
  },
};

export const demoCrops: Crop[] = seedCrops.map((crop) => {
  const values = demoValuesByCrop[crop.key];
  if (!values) {
    throw new Error(`Missing demo values for crop ${crop.key}`);
  }
  return { ...crop, ...values, sources: [...crop.sources, demoSource] };
});

type DemoPest = {
  key: string;
  es: string;
  en: string;
  scientificName: string;
  type: PestType;
  temperature: [number, number];
  humidity: [number, number] | null;
  families: string[];
  onlyCrops?: string[];
};

const demoPestRows: DemoPest[] = [
  { key: 'late-blight', es: 'Tizón tardío', en: 'Late blight', scientificName: 'Phytophthora infestans', type: 'oomycete', temperature: [10, 25], humidity: [90, 100], families: ['solanaceae'] },
  { key: 'early-blight', es: 'Tizón temprano', en: 'Early blight', scientificName: 'Alternaria solani', type: 'fungus', temperature: [20, 30], humidity: [80, 100], families: ['solanaceae'] },
  { key: 'guatemalan-potato-moth', es: 'Polilla guatemalteca', en: 'Guatemalan potato moth', scientificName: 'Tecia solanivora', type: 'insect', temperature: [10, 25], humidity: [60, 90], families: ['solanaceae'], onlyCrops: ['potato'] },
  { key: 'whitefly', es: 'Mosca blanca', en: 'Whitefly', scientificName: 'Bemisia tabaci', type: 'insect', temperature: [20, 32], humidity: [50, 80], families: ['solanaceae', 'cucurbitaceae'] },
  { key: 'tomato-leafminer', es: 'Polilla del tomate', en: 'Tomato leafminer', scientificName: 'Tuta absoluta', type: 'insect', temperature: [15, 30], humidity: [50, 80], families: ['solanaceae'], onlyCrops: ['tomato'] },
  { key: 'diamondback-moth', es: 'Polilla dorso de diamante', en: 'Diamondback moth', scientificName: 'Plutella xylostella', type: 'insect', temperature: [15, 30], humidity: [50, 85], families: ['brassicaceae'] },
  { key: 'clubroot', es: 'Hernia de la col', en: 'Clubroot', scientificName: 'Plasmodiophora brassicae', type: 'other', temperature: [18, 25], humidity: [80, 100], families: ['brassicaceae'] },
  { key: 'onion-downy-mildew', es: 'Mildiu de la cebolla', en: 'Onion downy mildew', scientificName: 'Peronospora destructor', type: 'oomycete', temperature: [10, 20], humidity: [95, 100], families: ['amaryllidaceae'] },
  { key: 'purple-blotch', es: 'Mancha púrpura', en: 'Purple blotch', scientificName: 'Alternaria porri', type: 'fungus', temperature: [20, 30], humidity: [80, 100], families: ['amaryllidaceae'] },
  { key: 'onion-thrips', es: 'Trips de la cebolla', en: 'Onion thrips', scientificName: 'Thrips tabaci', type: 'insect', temperature: [20, 30], humidity: [40, 70], families: ['amaryllidaceae', 'brassicaceae'] },
  { key: 'carrot-leaf-blight', es: 'Quemazón de la hoja', en: 'Carrot leaf blight', scientificName: 'Alternaria dauci', type: 'fungus', temperature: [18, 28], humidity: [85, 100], families: ['apiaceae'] },
  { key: 'root-knot-nematode', es: 'Nematodo agallador', en: 'Root-knot nematode', scientificName: 'Meloidogyne spp.', type: 'nematode', temperature: [20, 30], humidity: null, families: ['solanaceae', 'apiaceae', 'asteraceae', 'cucurbitaceae'] },
  { key: 'green-peach-aphid', es: 'Pulgón verde', en: 'Green peach aphid', scientificName: 'Myzus persicae', type: 'insect', temperature: [15, 25], humidity: [50, 80], families: ['solanaceae', 'brassicaceae', 'asteraceae'] },
  { key: 'lettuce-downy-mildew', es: 'Mildiu de la lechuga', en: 'Lettuce downy mildew', scientificName: 'Bremia lactucae', type: 'oomycete', temperature: [10, 20], humidity: [90, 100], families: ['asteraceae'] },
  { key: 'white-mold', es: 'Moho blanco', en: 'White mold', scientificName: 'Sclerotinia sclerotiorum', type: 'fungus', temperature: [15, 25], humidity: [90, 100], families: ['asteraceae', 'brassicaceae', 'apiaceae'] },
  { key: 'powdery-mildew-cucurbits', es: 'Oídio de las cucurbitáceas', en: 'Cucurbit powdery mildew', scientificName: 'Podosphaera xanthii', type: 'fungus', temperature: [20, 30], humidity: [50, 80], families: ['cucurbitaceae'] },
  { key: 'gray-mold', es: 'Moho gris', en: 'Gray mold', scientificName: 'Botrytis cinerea', type: 'fungus', temperature: [15, 25], humidity: [90, 100], families: ['rosaceae', 'solanaceae', 'asteraceae'] },
  { key: 'two-spotted-spider-mite', es: 'Araña roja', en: 'Two-spotted spider mite', scientificName: 'Tetranychus urticae', type: 'mite', temperature: [23, 32], humidity: [30, 60], families: ['rosaceae', 'solanaceae', 'cucurbitaceae'] },
];

export const demoPests: Pest[] = demoPestRows.map((row) => ({
  key: row.key,
  name: { es: row.es, en: row.en },
  scientificName: row.scientificName,
  type: row.type,
  temperatureInCelsius: range(...row.temperature),
  relativeHumidityInPercent: row.humidity ? range(...row.humidity) : { minimum: null, maximum: null },
  affectedFamilyKeys: row.families,
  onlyAffectsCropKeys: row.onlyCrops ?? [],
  sources: [demoSource],
}));
