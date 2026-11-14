import type { Coordinates } from './coordinates.js';

export type ElevationStatistics = {
  meanInMeters: number;
  minimumInMeters: number;
  maximumInMeters: number;
};

export type ElevationArea = {
  type: 'Polygon';
  coordinates: [number, number][][];
};

export abstract class ElevationProvider {
  abstract findElevationInMeters(coordinates: Coordinates): Promise<number | null>;

  abstract findElevationStatistics(
    area: ElevationArea,
    reference: Coordinates,
  ): Promise<ElevationStatistics | null>;
}
