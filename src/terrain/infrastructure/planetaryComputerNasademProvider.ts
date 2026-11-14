import { Injectable, Logger } from '@nestjs/common';
import type { Coordinates } from '../domain/coordinates.js';
import { ElevationProvider } from '../domain/elevationProvider.js';
import { nasademItemId } from './nasademItemId.js';

type PointResponse = { values?: number[] };

const pointEndpoint = 'https://planetarycomputer.microsoft.com/api/data/v1/item/point';
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
}
