import type { Coordinates } from '../domain/coordinates.js';
import { ElevationProvider } from '../domain/elevationProvider.js';
import { TerrainService } from './terrain.service.js';

class FakeElevationProvider extends ElevationProvider {
  calls: Coordinates[] = [];

  constructor(private readonly elevation: number | null) {
    super();
  }

  async findElevationInMeters(coordinates: Coordinates): Promise<number | null> {
    this.calls.push(coordinates);
    return this.elevation;
  }
}

describe('TerrainService', () => {
  it('returns the elevation in whole meters with its source', async () => {
    const service = new TerrainService(new FakeElevationProvider(2155.4));
    await expect(service.getElevation({ latitude: 9.918, longitude: -83.892 })).resolves.toEqual({
      latitude: 9.918,
      longitude: -83.892,
      elevationInMeters: 2155,
      source: 'NASADEM',
    });
  });

  it('returns null when there is no elevation data for the point', async () => {
    const service = new TerrainService(new FakeElevationProvider(null));
    await expect(service.getElevation({ latitude: 0, longitude: -150 })).resolves.toBeNull();
  });

  it('reuses the answer for points about ten meters apart', async () => {
    const provider = new FakeElevationProvider(2155);
    const service = new TerrainService(provider);
    await service.getElevation({ latitude: 9.91801, longitude: -83.89201 });
    await service.getElevation({ latitude: 9.91804, longitude: -83.89204 });
    expect(provider.calls).toHaveLength(1);
  });
});
