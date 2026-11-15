import { CatalogRepository } from '../domain/catalogRepository.js';
import type { Crop } from '../domain/crop.js';
import type { Pest } from '../domain/pest.js';
import type { PlantFamily } from '../domain/plantFamily.js';
import { CatalogService } from './catalog.service.js';

const emptyRange = { minimum: null, maximum: null };

function crop(key: string, familyKey: string): Crop {
  return {
    key,
    name: { es: key, en: key },
    scientificName: key,
    familyKey,
    demandLevel: 'high',
    nutrients: [],
    altitudeInMeters: emptyRange,
    temperatureInCelsius: emptyRange,
    waterNeedInMillimetersPerCycle: emptyRange,
    relativeHumidityInPercent: emptyRange,
    solarRadiationInKilowattHoursPerSquareMeterPerDay: emptyRange,
    cycleLengthInDays: emptyRange,
    sources: [],
  };
}

function pest(key: string, affectedFamilyKeys: string[], onlyAffectsCropKeys: string[] = []): Pest {
  return {
    key,
    name: { es: key, en: key },
    scientificName: key,
    type: 'pest',
    affectedFamilyKeys,
    onlyAffectsCropKeys,
    sources: [],
  };
}

class InMemoryCatalogRepository extends CatalogRepository {
  constructor(
    private readonly crops: Crop[],
    private readonly pests: Pest[],
  ) {
    super();
  }
  async findFamilies(): Promise<PlantFamily[]> {
    return [];
  }
  async findCrops(): Promise<Crop[]> {
    return this.crops;
  }
  async findCropByKey(key: string): Promise<Crop | null> {
    return this.crops.find((candidate) => candidate.key === key) ?? null;
  }
  async findPests(): Promise<Pest[]> {
    return this.pests;
  }
}

describe('CatalogService.findPestsForCrop', () => {
  const repository = new InMemoryCatalogRepository(
    [crop('potato', 'solanaceae'), crop('tomato', 'solanaceae'), crop('cabbage', 'brassicaceae')],
    [
      pest('potato-moth', ['solanaceae'], ['potato']),
      pest('late-blight', ['solanaceae']),
      pest('diamondback-moth', ['brassicaceae']),
    ],
  );
  const service = new CatalogService(repository);

  it('returns the pests that attack the family of the crop', async () => {
    const pests = await service.findPestsForCrop('tomato');
    expect(pests?.map((candidate) => candidate.key)).toEqual(['late-blight']);
  });

  it('includes a pest limited to specific crops only for those crops', async () => {
    const pests = await service.findPestsForCrop('potato');
    expect(pests?.map((candidate) => candidate.key)).toEqual(['potato-moth', 'late-blight']);
  });

  it('returns null for a crop that is not in the catalog', async () => {
    await expect(service.findPestsForCrop('coffee')).resolves.toBeNull();
  });
});
