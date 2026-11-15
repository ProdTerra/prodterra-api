import type { Coordinates } from '../../terrain/domain/coordinates.js';
import { ElevationProvider, type ElevationStatistics } from '../../terrain/domain/elevationProvider.js';
import { ClimatologyProvider, type GridClimatology } from '../domain/climatologyProvider.js';
import type { LotBoundary } from '../domain/lotBoundary.js';
import { LotClimateProfileService } from './lotClimateProfile.service.js';

const boundary: LotBoundary = {
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

class FakeElevationProvider extends ElevationProvider {
  constructor(private readonly statistics: ElevationStatistics | null) {
    super();
  }
  async findElevationInMeters(): Promise<number | null> {
    return null;
  }
  async findElevationStatistics(): Promise<ElevationStatistics | null> {
    return this.statistics;
  }
}

class FakeClimatologyProvider extends ClimatologyProvider {
  requested: Coordinates | null = null;
  async findMonthlyClimatology(coordinates: Coordinates): Promise<GridClimatology> {
    this.requested = coordinates;
    return {
      gridElevationInMeters: 1065,
      months: [
        {
          month: 1,
          meanTemperatureInCelsius: 19.1,
          minimumTemperatureInCelsius: 12.4,
          maximumTemperatureInCelsius: 26,
          relativeHumidityInPercent: 90,
          precipitationInMillimetersPerDay: 3.8,
          solarRadiationInKilowattHoursPerSquareMeterPerDay: 4.5,
        },
      ],
    };
  }
}

describe('LotClimateProfileService', () => {
  it('builds the profile with temperatures corrected to the mean lot elevation', async () => {
    const climatology = new FakeClimatologyProvider();
    const service = new LotClimateProfileService(
      new FakeElevationProvider({ meanInMeters: 2155.4, minimumInMeters: 2150, maximumInMeters: 2205 }),
      climatology,
    );

    const profile = await service.buildProfile(boundary);

    expect(climatology.requested).toEqual({ latitude: 9.918667, longitude: -83.890667 });
    expect(profile).toEqual({
      elevation: { meanInMeters: 2155, minimumInMeters: 2150, maximumInMeters: 2205, source: 'NASADEM' },
      climateGridElevationInMeters: 1065,
      temperatureCorrectionInCelsius: -7.1,
      climateSource: 'NASA POWER monthly climatology 2001-2025',
      months: [
        {
          month: 1,
          meanTemperatureInCelsius: 12,
          minimumTemperatureInCelsius: 5.3,
          maximumTemperatureInCelsius: 18.9,
          relativeHumidityInPercent: 90,
          precipitationInMillimetersPerDay: 3.8,
          solarRadiationInKilowattHoursPerSquareMeterPerDay: 4.5,
        },
      ],
    });
  });

  it('returns null when there is no elevation data for the lot', async () => {
    const service = new LotClimateProfileService(new FakeElevationProvider(null), new FakeClimatologyProvider());
    await expect(service.buildProfile(boundary)).resolves.toBeNull();
  });
});
