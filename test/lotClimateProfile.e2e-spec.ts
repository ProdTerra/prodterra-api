import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { ClimateModule } from '../src/climate/climate.module.js';
import { ClimatologyProvider, type GridClimatology } from '../src/climate/domain/climatologyProvider.js';
import { configureApplication } from '../src/configureApplication.js';
import { ElevationProvider, type ElevationStatistics } from '../src/terrain/domain/elevationProvider.js';

class FixedElevationProvider extends ElevationProvider {
  async findElevationInMeters(): Promise<number | null> {
    return null;
  }
  async findElevationStatistics(): Promise<ElevationStatistics | null> {
    return { meanInMeters: 2155, minimumInMeters: 2150, maximumInMeters: 2205 };
  }
}

class FixedClimatologyProvider extends ClimatologyProvider {
  async findMonthlyClimatology(): Promise<GridClimatology> {
    return {
      gridElevationInMeters: 1065,
      months: [
        {
          month: 6,
          meanTemperatureInCelsius: 20.9,
          minimumTemperatureInCelsius: 14.4,
          maximumTemperatureInCelsius: 27.5,
          relativeHumidityInPercent: 91,
          precipitationInMillimetersPerDay: 8,
          solarRadiationInKilowattHoursPerSquareMeterPerDay: 4.2,
        },
      ],
    };
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

describe('POST /lots/climate-profile', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [ClimateModule] })
      .overrideProvider(ElevationProvider)
      .useClass(FixedElevationProvider)
      .overrideProvider(ClimatologyProvider)
      .useClass(FixedClimatologyProvider)
      .compile();
    app = moduleRef.createNestApplication();
    configureApplication(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns the lot profile with altitude-corrected temperatures', async () => {
    const response = await request(app.getHttpServer()).post('/lots/climate-profile').send({ boundary });
    expect(response.status).toBe(200);
    expect(response.body.temperatureCorrectionInCelsius).toBe(-7.1);
    expect(response.body.months[0]).toMatchObject({ month: 6, meanTemperatureInCelsius: 13.8, relativeHumidityInPercent: 91 });
  });

  it('rejects a boundary that is not a closed polygon', async () => {
    const response = await request(app.getHttpServer())
      .post('/lots/climate-profile')
      .send({ boundary: { type: 'Polygon', coordinates: [[[-83.892, 9.918], [-83.89, 9.918]]] } });
    expect(response.status).toBe(400);
  });
});
