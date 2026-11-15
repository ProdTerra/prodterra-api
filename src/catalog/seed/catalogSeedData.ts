import type { Range, Source } from '../domain/catalogValues.js';
import type { Crop, Nutrient } from '../domain/crop.js';
import type { Pest } from '../domain/pest.js';
import type { PlantFamily } from '../domain/plantFamily.js';
import { buildPestsFromSpreadsheet, type SpreadsheetCropPests } from './spreadsheetPests.js';

/*
 * Real catalog taken from the team spreadsheet "base de datos productos agro.xlsb".
 * Sheet "Parámetros" gives one row per crop; sheet "links" gives the sources.
 * English and scientific names are translations approved by the team on 2026-11-15.
 * Values the sheet does not have stay null or empty: nutrient levels, demand level,
 * solar radiation and some humidity minimums. Water need is mm per whole growing cycle.
 */

const spreadsheetSource: Source = { label: 'Base de datos productos agro (hojas Parámetros y links)', url: null };

const globalSources: Source[] = [
  {
    label: 'INTA - manuales técnicos (enfermedades y plagas de cada producto)',
    url: 'https://sitiotemp.inta.go.cr/index.php/transferencia-de-tecnologia/publicaciones/manuales.html',
  },
  {
    label: 'FAO - Crop water needs',
    url: 'https://www.fao.org/4/s2022e/s2022e07.htm#3.3%20calculation%20of%20the%20crop%20water%20need',
  },
  {
    label:
      'FAO (2011). Manual técnico: Producción artesanal de semillas de hortalizas para la huerta familiar (temperaturas de los cultivos)',
    url: 'https://www.fao.org/3/i2029s/i2029s.pdf',
  },
];

const teamDataSource: Source = { label: 'Dato del equipo ProdTerra (2026-11-15)', url: null };

const eggplantColumnsSwappedSource: Source = {
  label: 'Berenjena - columnas Enfermedad y Plagas intercambiadas en la hoja, corregidas con confirmación del equipo ProdTerra (2026-11-15)',
  url: null,
};

const familyEnglishNames: Record<string, string> = {
  solanaceae: 'Nightshade family',
  amaryllidaceae: 'Onion family',
  apiaceae: 'Carrot family',
  lauraceae: 'Laurel family',
  euphorbiaceae: 'Spurge family',
  poaceae: 'Grass family',
  brassicaceae: 'Cabbage family',
  rubiaceae: 'Coffee family',
};

const familyKeyBySpreadsheetName: Record<string, string> = {
  'solanáceas': 'solanaceae',
  'amarilidáceas': 'amaryllidaceae',
  apiaceae: 'apiaceae',
  'brasicáceas': 'brassicaceae',
  'lauráceas': 'lauraceae',
  euforbiaceae: 'euphorbiaceae',
  poaceae: 'poaceae',
  gramineas: 'poaceae',
  'rubiáceas': 'rubiaceae',
};

type SpreadsheetRow = {
  key: string;
  product: string;
  englishName: string;
  scientificName: string;
  altitudeInMeters: Range;
  temperatureInCelsius: Range;
  family: string;
  nutrient: Nutrient;
  waterNeedInMillimetersPerCycle: Range;
  relativeHumidityInPercent: Range;
  diseases: string;
  pests: string;
  harvestDurationInDays: number;
  sources: Source[];
};

const range = (minimum: number | null, maximum: number | null): Range => ({ minimum, maximum });

const linkSource = (cropName: string, url: string): Source => ({ label: `${cropName} - ${new URL(url).host}`, url });
const citationSource = (cropName: string, citation: string): Source => ({ label: `${cropName} - ${citation}`, url: null });

const spreadsheetRows: SpreadsheetRow[] = [
  {
    key: 'potato',
    product: 'papa',
    englishName: 'Potato',
    scientificName: 'Solanum tuberosum',
    altitudeInMeters: range(1500, 2600),
    temperatureInCelsius: range(15, 25),
    family: 'Solanáceas',
    nutrient: 'N',
    waterNeedInMillimetersPerCycle: range(500, 700),
    relativeHumidityInPercent: range(70, 80),
    diseases: 'Phytophthora infestans, Spongospora\nsubterranea',
    pests: 'Epitrix spp, Trialeurodes\nvaporariorum',
    harvestDurationInDays: 80,
    sources: [
      linkSource('Papa', 'https://repositorio.iica.int/bitstreams/06ba5470-8a6b-45c0-a1af-2f4f6c9f54c4/download'),
      linkSource('Papa', 'https://repository.agrosavia.co/server/api/core/bitstreams/281832e5-93a8-47f9-ae98-54739c702f02/content'),
      linkSource('Papa', 'https://eos.com/es/blog/cultivo-de-papa/'),
    ],
  },
  {
    key: 'onion',
    product: 'cebolla',
    englishName: 'Onion',
    scientificName: 'Allium cepa',
    altitudeInMeters: range(0, 2800),
    temperatureInCelsius: range(12.8, 24),
    family: 'Amarilidáceas',
    nutrient: 'K',
    waterNeedInMillimetersPerCycle: range(350, 550),
    relativeHumidityInPercent: range(null, 70),
    diseases: 'Mancha púrpura (Alternaria porri), Antracnosis (Colletotrichum gloesporioides)',
    pests: 'Trips (Thrips tabaci), orugas (Spodoptera spp.)',
    harvestDurationInDays: 180,
    sources: [
      linkSource('Cebolla', 'https://www.haifa-group.com/croprecommendations/onion-ferilizer-crop-guide-growth-conditions'),
      linkSource('Cebolla', 'https://www.jica.go.jp/Resource/paraguay/espanol/office/others/c8h0vm0000ad5gke-att/gt_02.pdf'),
      citationSource(
        'Cebolla',
        'Santibáñez, F. 1994. Crop requirements: Temperate crops. In: Hanbook of agricultural meteorology. J. F. Griffiths Editor. Oxford Univ. Press. New York., USA. pp. 174-188',
      ),
      citationSource(
        'Cebolla',
        'Benacchio, S.S. 1982. Algunas exigencias agroecológicas en 58 especies de cultivo con potencial de producción en el Trópico Americano. FONAIAP-Centro Nal. de Inv. Agropecuarias. Ministerio de Agricultura y Cría. Maracay, Venezuela. 202 p.',
      ),
    ],
  },
  {
    key: 'tomato',
    product: 'tomate',
    englishName: 'Tomato',
    scientificName: 'Solanum lycopersicum',
    altitudeInMeters: range(0, 2000),
    temperatureInCelsius: range(18, 29),
    family: 'Solanáceas',
    nutrient: 'P',
    waterNeedInMillimetersPerCycle: range(400, 800),
    relativeHumidityInPercent: range(70, 80),
    diseases: 'Mancha foliar por septoria, Marchitez bacterial',
    pests: 'Áfido, pulgón verde-amarillento, Cortadores, tierrero rosquilla (Agrotis spp.)',
    harvestDurationInDays: 75,
    sources: [
      linkSource('Tomate', 'https://www.jica.go.jp/Resource/project/english/kenya/015/materials/c8h0vm0000f7o8cj-att/materials_26.pdf'),
      linkSource('Tomate', 'https://www.haifa-group.com/files/Guides/tomato/Tomato.pdf'),
      teamDataSource,
    ],
  },
  {
    key: 'eggplant',
    product: 'Berenjena',
    englishName: 'Eggplant',
    scientificName: 'Solanum melongena',
    altitudeInMeters: range(0, 1600),
    temperatureInCelsius: range(20, 25),
    family: 'Solanáceas',
    nutrient: 'K',
    waterNeedInMillimetersPerCycle: range(1000, 1500),
    relativeHumidityInPercent: range(50, 65),
    diseases: 'Phytophthora infestans, Alternaria solani ',
    pests: 'Agrotis sp, Tetranychus urticae (koch)',
    harvestDurationInDays: 85,
    sources: [
      eggplantColumnsSwappedSource,
      linkSource('Berenjena', 'https://biblioteca.inia.cl/server/api/core/bitstreams/07408a10-2066-443f-bed6-d176e3efb319/content'),
      linkSource(
        'Berenjena',
        'https://dagus.unison.mx/Zamora/4.%20EL%20CULTIVO%20DE%20LA%20BERENJENA%20(Solanum%20melongena%20L.)%20BAJO%20CUBIERTAS%20PLASTICAS.pdf',
      ),
      linkSource(
        'Berenjena',
        'https://www.jica.go.jp/domestic/tsukuba/activities/agricul/__icsFiles/afieldfile/2026/03/23/08_Egg_Plant_SHEP_PLUS.pdf',
      ),
    ],
  },
  {
    key: 'cilantro',
    product: 'cilantro',
    englishName: 'Cilantro',
    scientificName: 'Coriandrum sativum',
    altitudeInMeters: range(100, 1500),
    temperatureInCelsius: range(15, 30),
    family: 'Apiaceae',
    nutrient: 'N',
    waterNeedInMillimetersPerCycle: range(400, 600),
    relativeHumidityInPercent: range(65, 70),
    diseases: 'Fusarium oxysforum, Rhizoctonia\nsp. Y',
    pests: 'Cavariella aegopodii, Pseudaletia unipuncta',
    harvestDurationInDays: 120,
    sources: [
      linkSource('Cilantro', 'https://biblioteca.inia.cl/server/api/core/bitstreams/f2b84d26-edd0-4fe2-985e-0fdba2cc19dd/content'),
      linkSource('Cilantro', 'https://geotechve.com/cilantro/'),
      linkSource('Cilantro', 'https://plantvillage.psu.edu/topics/coriander-cilantro/infos'),
      linkSource('Cilantro', 'https://www.ortomec.com/es/siembra-de-cilantro-todo-lo-que-debes-saber/'),
    ],
  },
  {
    key: 'sweet-pepper',
    product: 'chile dulce',
    englishName: 'Sweet pepper',
    scientificName: 'Capsicum annuum',
    altitudeInMeters: range(0, 2300),
    temperatureInCelsius: range(20, 30),
    family: 'Solanáceas',
    nutrient: 'N',
    waterNeedInMillimetersPerCycle: range(600, 900),
    relativeHumidityInPercent: range(60, 80),
    diseases: 'Mancha foliar por septoria,Marchitez bacterial',
    pests: 'Áfido, pulgón verde-amarillento, Cortadores, tierrero rosquilla (Agrotis spp.)',
    harvestDurationInDays: 120,
    sources: [
      linkSource('Chile dulce', 'https://fundecooperacion.org/wp-content/uploads/2024/10/Manual-ChileDulce.pdf'),
      linkSource('Chile dulce', 'https://fundesyram.info/fichas/cultivo-de-chile-dulce'),
    ],
  },
  {
    key: 'avocado',
    product: 'aguacate de bajura',
    englishName: 'Lowland avocado',
    scientificName: 'Persea americana',
    altitudeInMeters: range(1000, 1500),
    temperatureInCelsius: range(20, 30),
    family: 'Lauráceas',
    nutrient: 'N',
    waterNeedInMillimetersPerCycle: range(1800, 2000),
    relativeHumidityInPercent: range(null, 65),
    diseases: 'Cercospora purpurea, Cooke, Antracnosis',
    pests: 'Heliothrips haemborroidalis y Selenothrip rubrocicantus, Oligonychus punicae Hirst',
    harvestDurationInDays: 1825,
    sources: [
      linkSource('Aguacate de bajura', 'https://intranet.cedaf.org.do/publicaciones/guias/download/aguacate.pdf'),
      linkSource('Aguacate de bajura', 'https://eos.com/es/blog/cultivo-de-aguacate/'),
    ],
  },
  {
    key: 'cassava',
    product: 'yuca',
    englishName: 'Cassava',
    scientificName: 'Manihot esculenta',
    altitudeInMeters: range(0, 1800),
    temperatureInCelsius: range(16, 38),
    family: 'Euforbiaceae',
    nutrient: 'K',
    waterNeedInMillimetersPerCycle: range(750, 2000),
    relativeHumidityInPercent: range(50, 90),
    diseases: 'Sphaceloma\nmanihoticola, Cercosporidium henningsii',
    pests: 'Erynnis ello, Tetranychus urticae',
    harvestDurationInDays: 365,
    sources: [
      linkSource('Yuca', 'https://www.icta.gob.gt/publicaciones/Yuca/Manual%20Cultivo%20de%20yuca%20ICTA.pdf'),
      linkSource('Yuca', 'https://www.fao.org/4/a1028s/a1028s01.pdf'),
    ],
  },
  {
    key: 'sugarcane',
    product: 'caña de azúcar',
    englishName: 'Sugarcane',
    scientificName: 'Saccharum officinarum',
    altitudeInMeters: range(0, 1000),
    temperatureInCelsius: range(27, 33),
    family: 'Poaceae',
    nutrient: 'N',
    waterNeedInMillimetersPerCycle: range(1200, 1500),
    relativeHumidityInPercent: range(80, 85),
    diseases: 'N/A',
    pests: 'Aenolamia postica, Diatraea spp',
    harvestDurationInDays: 365,
    sources: [
      linkSource('Caña de azúcar', 'https://www.jica.go.jp/Resource/paraguay/espanol/office/others/c8h0vm0000ad5gke-att/gt_01.pdf'),
      linkSource('Caña de azúcar', 'https://www.abonamos.com/cana-de-azucar'),
      linkSource('Caña de azúcar', 'https://bdigital.zamorano.edu/server/api/core/bitstreams/a66402aa-4881-4ad1-bd65-f52a1ee5fff1/content'),
      linkSource(
        'Caña de azúcar',
        'https://servicios.laica.co.cr/laica-cv-biblioteca/index.php/Library/download/QGoyokYcwoekMeivkCReoXKCEAVTkzHe',
      ),
    ],
  },
  {
    key: 'cabbage',
    product: 'repollo',
    englishName: 'Cabbage',
    scientificName: 'Brassica oleracea var. capitata',
    altitudeInMeters: range(700, 2200),
    temperatureInCelsius: range(16, 20),
    family: 'brasicáceas',
    nutrient: 'N',
    waterNeedInMillimetersPerCycle: range(350, 500),
    relativeHumidityInPercent: range(60, 80),
    diseases: 'Mal del talluelo, Pudrición negra bacteriana',
    pests: 'Polilla dorso de diamante, Mosca de sierra de la col',
    harvestDurationInDays: 90,
    sources: [
      linkSource('Repollo', 'https://www.jica.go.jp/Resource/project/english/kenya/015/materials/c8h0vm0000f7o8cj-att/materials_21.pdf'),
      citationSource('Repollo', 'doc inge jennifer'),
    ],
  },
  {
    key: 'coffee',
    product: 'café',
    englishName: 'Coffee',
    scientificName: 'Coffea arabica',
    altitudeInMeters: range(500, 1700),
    temperatureInCelsius: range(17, 23),
    family: 'Rubiáceas',
    nutrient: 'K',
    waterNeedInMillimetersPerCycle: range(1000, 3000),
    relativeHumidityInPercent: range(null, 85),
    diseases: 'El Ojo de Gallo, La Roya del Café',
    pests: 'Meloidogyne exigua, Pratylenchus spp',
    harvestDurationInDays: 365,
    sources: [
      linkSource('Café', 'https://www.icafe.cr/wp-content/uploads/cicafe/documentos/GUIA-TECNICA-V10.pdf'),
      linkSource('Café', 'https://www.uprm.edu/ecosdelcafe/wp-content/uploads/sites/133/2018/11/BOT_NICA_DEL_CAFETO.pdf'),
      linkSource('Café', 'https://www.yara.cr/nutricion-vegetal/nuestro-cafe-by-yara/resumen-nutricional/'),
      linkSource('Café', 'https://blog.cambiagro.com/cafe/etapa-vegetativa/etapa-vegetativa/'),
    ],
  },
  {
    key: 'maize',
    product: 'maíz',
    englishName: 'Maize',
    scientificName: 'Zea mays',
    altitudeInMeters: range(0, 900),
    temperatureInCelsius: range(20, 30),
    family: 'Gramineas',
    nutrient: 'N',
    waterNeedInMillimetersPerCycle: range(500, 700),
    relativeHumidityInPercent: range(60, 70),
    diseases: 'STENOCARPELLA, Fusarium ',
    pests: 'Phyllophaga spp, Melanotus sp',
    harvestDurationInDays: 110,
    sources: [
      linkSource('Maíz', 'https://www.jica.go.jp/Resource/paraguay/espanol/office/others/c8h0vm0000ad5gke-att/gt_04.pdf'),
      linkSource('Maíz', 'https://www.centa.gob.sv/download/guia-tecnica-cultivo-de-maiz/'),
      linkSource('Maíz', 'https://agriculture.basf.com/py/es/proteccion-de-cultivos-y-semillas/cultivos/cultivo-de-maiz'),
    ],
  },
];

function capitalizeFirstLetter(text: string): string {
  const trimmed = text.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function familyKeyOf(spreadsheetFamily: string): string {
  const familyKey = familyKeyBySpreadsheetName[spreadsheetFamily.trim().toLowerCase()];
  if (!familyKey) {
    throw new Error(`Unknown family "${spreadsheetFamily}" in the spreadsheet`);
  }
  return familyKey;
}

function toCrop(row: SpreadsheetRow): Crop {
  return {
    key: row.key,
    name: { es: capitalizeFirstLetter(row.product), en: row.englishName },
    scientificName: row.scientificName,
    familyKey: familyKeyOf(row.family),
    demandLevel: null,
    nutrients: [{ nutrient: row.nutrient }],
    altitudeInMeters: row.altitudeInMeters,
    temperatureInCelsius: row.temperatureInCelsius,
    waterNeedInMillimetersPerCycle: row.waterNeedInMillimetersPerCycle,
    relativeHumidityInPercent: row.relativeHumidityInPercent,
    solarRadiationInKilowattHoursPerSquareMeterPerDay: range(null, null),
    cycleLengthInDays: range(row.harvestDurationInDays, row.harvestDurationInDays),
    sources: [spreadsheetSource, ...row.sources, ...globalSources],
  };
}

function toFamilies(rows: SpreadsheetRow[]): PlantFamily[] {
  const familiesByKey = new Map<string, PlantFamily>();
  for (const row of rows) {
    const key = familyKeyOf(row.family);
    if (!familiesByKey.has(key)) {
      familiesByKey.set(key, {
        key,
        scientificName: capitalizeFirstLetter(key),
        name: { es: capitalizeFirstLetter(row.family), en: familyEnglishNames[key] },
        sources: [spreadsheetSource],
      });
    }
  }
  return [...familiesByKey.values()];
}

function toSpreadsheetCropPests(row: SpreadsheetRow): SpreadsheetCropPests {
  return { cropKey: row.key, familyKey: familyKeyOf(row.family), diseaseCell: row.diseases, pestCell: row.pests };
}

export const seedFamilies: PlantFamily[] = toFamilies(spreadsheetRows);

export const seedCrops: Crop[] = spreadsheetRows.map(toCrop);

type PestTranslation = { en: string; scientificName: string | null };

const pestsNamedOnlyScientifically = [
  'phytophthora-infestans',
  'spongospora-subterranea',
  'epitrix-spp',
  'trialeurodes-vaporariorum',
  'agrotis-sp',
  'tetranychus-urticae-koch',
  'alternaria-solani',
  'fusarium-oxysforum',
  'rhizoctonia-sp',
  'cavariella-aegopodii',
  'pseudaletia-unipuncta',
  'cercospora-purpurea-cooke',
  'heliothrips-haemborroidalis',
  'selenothrip-rubrocicantus',
  'oligonychus-punicae-hirst',
  'sphaceloma-manihoticola',
  'cercosporidium-henningsii',
  'erynnis-ello',
  'tetranychus-urticae',
  'aenolamia-postica',
  'diatraea-spp',
  'meloidogyne-exigua',
  'pratylenchus-spp',
  'stenocarpella',
  'fusarium',
  'phyllophaga-spp',
  'melanotus-sp',
];

const pestTranslations: Record<string, PestTranslation> = {
  'mancha-purpura-alternaria-porri': { en: 'Purple blotch', scientificName: 'Alternaria porri' },
  'antracnosis-colletotrichum-gloesporioides': { en: 'Anthracnose', scientificName: 'Colletotrichum gloesporioides' },
  'trips-thrips-tabaci': { en: 'Thrips', scientificName: 'Thrips tabaci' },
  'orugas-spodoptera-spp': { en: 'Caterpillars', scientificName: 'Spodoptera spp.' },
  'mancha-foliar-por-septoria': { en: 'Septoria leaf spot', scientificName: null },
  'marchitez-bacterial': { en: 'Bacterial wilt', scientificName: null },
  afido: { en: 'Aphid', scientificName: null },
  'pulgon-verde-amarillento': { en: 'Yellowish-green aphid', scientificName: null },
  cortadores: { en: 'Cutworms', scientificName: null },
  'tierrero-rosquilla-agrotis-spp': { en: 'Agrotis cutworm', scientificName: 'Agrotis spp.' },
  antracnosis: { en: 'Anthracnose', scientificName: null },
  'mal-del-talluelo': { en: 'Damping-off', scientificName: null },
  'pudricion-negra-bacteriana': { en: 'Bacterial black rot', scientificName: null },
  'polilla-dorso-de-diamante': { en: 'Diamondback moth', scientificName: null },
  'mosca-de-sierra-de-la-col': { en: 'Cabbage sawfly', scientificName: null },
  'el-ojo-de-gallo': { en: 'American leaf spot', scientificName: null },
  'la-roya-del-cafe': { en: 'Coffee leaf rust', scientificName: null },
};

function translationOf(pest: Pest): PestTranslation {
  if (pestsNamedOnlyScientifically.includes(pest.key)) {
    return { en: pest.name.es, scientificName: pest.name.es };
  }
  const translation = pestTranslations[pest.key];
  if (!translation) {
    throw new Error(`Missing English name for pest ${pest.key}`);
  }
  return translation;
}

function withTranslation(pest: Pest): Pest {
  const { en, scientificName } = translationOf(pest);
  return { ...pest, name: { ...pest.name, en }, scientificName };
}

export const seedPests: Pest[] = buildPestsFromSpreadsheet(spreadsheetRows.map(toSpreadsheetCropPests), [
  spreadsheetSource,
  globalSources[0],
]).map(withTranslation);
