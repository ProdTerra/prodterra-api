import { Injectable, Logger } from '@nestjs/common';
import type { Coordinates } from '../domain/coordinates.js';
import {
  ElevationProvider,
  type ElevationArea,
  type ElevationStatistics,
} from '../domain/elevationProvider.js';
import { nasademItemId } from './nasademItemId.js';

type PointResponse = { values?: number[] };
type BandStatistics = { mean?: number; min?: number; max?: number; count?: number };
type StatisticsResponse = { properties?: { statistics?: Record<string, BandStatistics> } };

const dataEndpoint = 'https://planetarycomputer.microsoft.com/api/data/v1/item';
const pointEndpoint = `${dataEndpoint}/point`;
const statisticsEndpoint = `${dataEndpoint}/statistics`;
const notFoundStatus = 404;
const requestTimeoutInMilliseconds = 8_000;

@Injectable()
export class PlanetaryComputerNasademProvider extends ElevationProvider {
  private readonly logger = new Logger(PlanetaryComputerNasademProvider.name);

  async findElevationInMeters(coordinates: Coordinates): Promise<number | null> {
    const url = new URL(`${pointEndpoint}/${coordinates.longitude},${coordinates.latitude}`);
    url.search = new URLSearchParams({
      collection: 'nasadem',
      item: nasademItemId(coordinates),
      assets: 'elevation',
    }).toString();

    const response = await fetch(url, { signal: AbortSignal.timeout(requestTimeoutInMilliseconds) });
    if (response.status === notFoundStatus) {
      return null;
    }
    if (!response.ok) {
      this.logger.warn(`NASADEM point request failed with status ${response.status}`);
      throw new Error(`NASADEM point request failed with status ${response.status}`);
    }
    const body = (await response.json()) as PointResponse;
    const elevation = body.values?.[0];
    return Number.isFinite(elevation) ? (elevation as number) : null;
  }

  async findElevationStatistics(
    area: ElevationArea,
    reference: Coordinates,
  ): Promise<ElevationStatistics | null> {
    const url = new URL(statisticsEndpoint);
    url.search = new URLSearchParams({
      collection: 'nasadem',
      item: nasademItemId(reference),
      assets: 'elevation',
    }).toString();

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: 'Feature', properties: {}, geometry: area }),
      signal: AbortSignal.timeout(requestTimeoutInMilliseconds),
    });
    if (response.status === notFoundStatus) {
      return null;
    }
    if (!response.ok) {
      this.logger.warn(`NASADEM statistics request failed with status ${response.status}`);
      throw new Error(`NASADEM statistics request failed with status ${response.status}`);
    }
    const body = (await response.json()) as StatisticsResponse;
    const band = Object.values(body.properties?.statistics ?? {})[0];
    if (!band?.count || ![band.mean, band.min, band.max].every(Number.isFinite)) {
      return null;
    }
    return {
      meanInMeters: band.mean as number,
      minimumInMeters: band.min as number,
      maximumInMeters: band.max as number,
    };
  }
}
