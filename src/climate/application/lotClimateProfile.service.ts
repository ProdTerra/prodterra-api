import { Injectable } from '@nestjs/common';
import { ElevationProvider } from '../../terrain/domain/elevationProvider.js';
import { correctMonthForAltitude, temperatureCorrectionInCelsius } from '../domain/altitudeCorrection.js';
import { ClimatologyProvider } from '../domain/climatologyProvider.js';
import { centroidOf, type LotBoundary } from '../domain/lotBoundary.js';
import type { LotClimateProfile } from '../domain/lotClimateProfile.js';

const climateSource = 'NASA POWER monthly climatology 2001-2025';

@Injectable()
export class LotClimateProfileService {
  constructor(
    private readonly elevationProvider: ElevationProvider,
    private readonly climatologyProvider: ClimatologyProvider,
  ) {}

  async buildProfile(boundary: LotBoundary): Promise<LotClimateProfile | null> {
    const center = centroidOf(boundary);
    const [elevation, climatology] = await Promise.all([
      this.elevationProvider.findElevationStatistics(boundary, center),
      this.climatologyProvider.findMonthlyClimatology(center),
    ]);
    if (!elevation) {
      return null;
    }
    const correction =
      Math.round(temperatureCorrectionInCelsius(climatology.gridElevationInMeters, elevation.meanInMeters) * 10) / 10;

    return {
      elevation: {
        meanInMeters: Math.round(elevation.meanInMeters),
        minimumInMeters: Math.round(elevation.minimumInMeters),
        maximumInMeters: Math.round(elevation.maximumInMeters),
        source: 'NASADEM',
      },
      climateGridElevationInMeters: Math.round(climatology.gridElevationInMeters),
      temperatureCorrectionInCelsius: correction,
      climateSource,
      months: climatology.months.map((month) => correctMonthForAltitude(month, correction)),
    };
  }
}
