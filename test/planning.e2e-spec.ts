import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { CatalogRepository } from '../src/catalog/domain/catalogRepository.js';
import type { Crop } from '../src/catalog/domain/crop.js';
import type { Pest } from '../src/catalog/domain/pest.js';
import type { PlantFamily } from '../src/catalog/domain/plantFamily.js';
import { demoCrops, demoPests } from '../src/catalog/seed/demoCatalogData.js';
import { LotClimateProfileService } from '../src/climate/application/lotClimateProfile.service.js';
import type { LotClimateProfile } from '../src/climate/domain/lotClimateProfile.js';
import { configureApplication } from '../src/configureApplication.js';
import { PlanningService } from '../src/planning/application/planning.service.js';
import { PlanningController } from '../src/planning/presentation/planning.controller.js';

class DemoCatalogRepository extends CatalogRepository {
  async findFamilies(): Promise<PlantFamily[]> {
    return [];
  }
  async findCrops(): Promise<Crop[]> {
    return demoCrops;
  }
  async findCropByKey(key: string): Promise<Crop | null> {
    return demoCrops.find((crop) => crop.key === key) ?? null;
  }
  async findPests(): Promise<Pest[]> {
    return demoPests;
  }
}

const highlandProfile: LotClimateProfile = {
  elevation: { meanInMeters: 2150, minimumInMeters: 2140, maximumInMeters: 2160, source: 'NASADEM' },
  climateGridElevationInMeters: 1065,
  temperatureCorrectionInCelsius: -7.1,
  climateSource: 'test',
  months: Array.from({ length: 12 }, (_, index) => ({
    month: index + 1,
    meanTemperatureInCelsius: 13,
    minimumTemperatureInCelsius: 6,
    maximumTemperatureInCelsius: 19,
    relativeHumidityInPercent: 88,
    precipitationInMillimetersPerDay: index < 4 ? 2.5 : 7.5,
    solarRadiationInKilowattHoursPerSquareMeterPerDay: 4.4,
  })),
};

class FixedClimateProfileService {
  async buildProfile(): Promise<LotClimateProfile> {
    return highlandProfile;
  }
}

const boundary = {
  type: 'Polygon',
  coordinates: [
    [
      [-83.892, 9.918],
      [-83.89, 9.918],
      [-83.89, 9.92],
      [-83.892, 9.918],
    ],
  ],
};

describe('POST /plans', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PlanningController],
      providers: [
        PlanningService,
        { provide: CatalogRepository, useClass: DemoCatalogRepository },
        { provide: LotClimateProfileService, useClass: FixedClimateProfileService },
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    configureApplication(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('plans every lot with its harvest, next crop and twelve months', async () => {
    const response = await request(app.getHttpServer())
      .post('/plans')
      .send({
        startMonth: '2026-11',
        lots: [
          {
            lotId: 'lot-1',
            boundary,
            currentUse: { kind: 'crop', cropKey: 'potato', plantedOn: '2026-09' },
            previousUse: { kind: 'unknown' },
            hasIrrigation: false,
          },
          { lotId: 'lot-2', boundary, currentUse: { kind: 'fallow' }, previousUse: { kind: 'fallow' }, hasIrrigation: true },
        ],
      });
    expect(response.status).toBe(200);
    expect(response.body.usesDemoData).toBe(true);
    const [firstLot, secondLot] = response.body.lots;
    expect(firstLot.currentCrop).toMatchObject({ cropKey: 'potato', harvestMonth: '2027-01' });
    expect(firstLot.nextCrop.cropKey).not.toBe('potato');
    expect(firstLot.nextCrop.cropKey).not.toBe('tomato');
    expect(firstLot.months).toHaveLength(12);
    expect(secondLot.months[0].phase).toBe('next');
    expect(response.body.crops.length).toBe(10);
  });

  it('rejects a lot without its answers', async () => {
    const response = await request(app.getHttpServer())
      .post('/plans')
      .send({ lots: [{ lotId: 'lot-1', boundary }] });
    expect(response.status).toBe(400);
    expect(response.body.message).toContain('lots[0]');
  });
});
