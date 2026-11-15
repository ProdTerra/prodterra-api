import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { CatalogService } from '../src/catalog/application/catalog.service.js';
import { CatalogRepository } from '../src/catalog/domain/catalogRepository.js';
import type { Crop } from '../src/catalog/domain/crop.js';
import type { Pest } from '../src/catalog/domain/pest.js';
import type { PlantFamily } from '../src/catalog/domain/plantFamily.js';
import { CatalogController } from '../src/catalog/presentation/catalog.controller.js';
import { seedCrops, seedFamilies } from '../src/catalog/seed/catalogSeedData.js';
import { configureApplication } from '../src/configureApplication.js';

const lateBlight: Pest = {
  key: 'late-blight',
  name: { es: 'Tizón tardío' },
  scientificName: 'Phytophthora infestans',
  type: 'disease',
  affectedFamilyKeys: ['solanaceae'],
  onlyAffectsCropKeys: [],
  sources: [],
};

class SeededCatalogRepository extends CatalogRepository {
  async findFamilies(): Promise<PlantFamily[]> {
    return seedFamilies;
  }
  async findCrops(): Promise<Crop[]> {
    return seedCrops;
  }
  async findCropByKey(key: string): Promise<Crop | null> {
    return seedCrops.find((crop) => crop.key === key) ?? null;
  }
  async findPests(): Promise<Pest[]> {
    return [lateBlight];
  }
}

describe('catalog endpoints', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [CatalogController],
      providers: [CatalogService, { provide: CatalogRepository, useClass: SeededCatalogRepository }],
    }).compile();
    app = moduleRef.createNestApplication();
    configureApplication(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('lists the crops with their family', async () => {
    const response = await request(app.getHttpServer()).get('/catalog/crops');
    expect(response.status).toBe(200);
    expect(response.body.map((crop: Crop) => [crop.key, crop.familyKey])).toContainEqual(['potato', 'solanaceae']);
  });

  it('gives every crop a reference cycle computed from its cycle length', async () => {
    const response = await request(app.getHttpServer()).get('/catalog/crops');
    for (const crop of response.body as (Crop & { referenceCycleInDays: number | null })[]) {
      expect(crop).toHaveProperty('referenceCycleInDays');
    }
  });

  it('lists the pests that affect a crop through its family', async () => {
    const response = await request(app.getHttpServer()).get('/catalog/crops/potato/pests');
    expect(response.status).toBe(200);
    expect(response.body.map((pest: Pest) => pest.key)).toEqual(['late-blight']);
  });

  it('answers the Spanish name as English when a pest has no English name', async () => {
    const response = await request(app.getHttpServer()).get('/catalog/pests');
    expect(response.body[0]).toMatchObject({ key: 'late-blight', name: { es: 'Tizón tardío', en: 'Tizón tardío' }, type: 'disease' });
    expect(response.body[0]).not.toHaveProperty('temperatureInCelsius');
  });

  it('serves the twelve crops of the spreadsheet with their English names', async () => {
    const response = await request(app.getHttpServer()).get('/catalog/crops');
    expect(response.body).toHaveLength(12);
    expect(response.body.find((crop: Crop) => crop.key === 'avocado')).toMatchObject({
      name: { es: 'Aguacate de bajura', en: 'Lowland avocado' },
      referenceCycleInDays: 1825,
    });
  });

  it('answers not found for a crop outside the catalog', async () => {
    const response = await request(app.getHttpServer()).get('/catalog/crops/strawberry/pests');
    expect(response.status).toBe(404);
  });
});
