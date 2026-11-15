import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { configureApplication } from '../src/configureApplication.js';
import type { Coordinates } from '../src/terrain/domain/coordinates.js';
import { ElevationProvider } from '../src/terrain/domain/elevationProvider.js';
import { TerrainModule } from '../src/terrain/terrain.module.js';

class FixedElevationProvider extends ElevationProvider {
  async findElevationInMeters({ longitude }: Coordinates): Promise<number | null> {
    return longitude < -100 ? null : 2155;
  }
}

describe('GET /terrain/elevation', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [TerrainModule] })
      .overrideProvider(ElevationProvider)
      .useClass(FixedElevationProvider)
      .compile();
    app = moduleRef.createNestApplication();
    configureApplication(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns the elevation of a point', async () => {
    const response = await request(app.getHttpServer())
      .get('/terrain/elevation')
      .query({ latitude: '9.918', longitude: '-83.892' });
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      latitude: 9.918,
      longitude: -83.892,
      elevationInMeters: 2155,
      source: 'NASADEM',
    });
  });

  it('rejects a latitude outside the globe', async () => {
    const response = await request(app.getHttpServer())
      .get('/terrain/elevation')
      .query({ latitude: '120', longitude: '-83.892' });
    expect(response.status).toBe(400);
  });

  it('answers not found when there is no elevation data', async () => {
    const response = await request(app.getHttpServer())
      .get('/terrain/elevation')
      .query({ latitude: '10', longitude: '-150' });
    expect(response.status).toBe(404);
  });
});
