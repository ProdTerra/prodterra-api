import { Injectable } from '@nestjs/common';
import type { Coordinates } from '../domain/coordinates.js';
import { ElevationProvider } from '../domain/elevationProvider.js';
import type { ElevationReading } from '../domain/elevationReading.js';

const cacheKeyDecimals = 4;
const maximumCachedPoints = 2_000;

@Injectable()
export class TerrainService {
  private readonly elevationCache = new Map<string, number | null>();

  constructor(private readonly elevationProvider: ElevationProvider) {}

  async getElevation(coordinates: Coordinates): Promise<ElevationReading | null> {
    const elevation = await this.findCachedElevation(coordinates);
    if (elevation === null) {
      return null;
    }
    return {
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      elevationInMeters: Math.round(elevation),
      source: 'NASADEM',
    };
  }

  private async findCachedElevation(coordinates: Coordinates): Promise<number | null> {
    const key = `${coordinates.latitude.toFixed(cacheKeyDecimals)},${coordinates.longitude.toFixed(cacheKeyDecimals)}`;
    if (this.elevationCache.has(key)) {
      return this.elevationCache.get(key) ?? null;
    }
    const elevation = await this.elevationProvider.findElevationInMeters(coordinates);
    this.rememberElevation(key, elevation);
    return elevation;
  }

  private rememberElevation(key: string, elevation: number | null): void {
    if (this.elevationCache.size >= maximumCachedPoints) {
      const oldestKey = this.elevationCache.keys().next().value;
      if (oldestKey !== undefined) {
        this.elevationCache.delete(oldestKey);
      }
    }
    this.elevationCache.set(key, elevation);
  }
}
