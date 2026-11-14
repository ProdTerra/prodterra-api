import type { Coordinates } from './coordinates.js';

export abstract class ElevationProvider {
  abstract findElevationInMeters(coordinates: Coordinates): Promise<number | null>;
}
