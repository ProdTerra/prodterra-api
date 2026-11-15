import type { Coordinates } from '../../terrain/domain/coordinates.js';
import type { MonthlyClimate } from './monthlyClimate.js';

export type GridClimatology = {
  gridElevationInMeters: number;
  months: MonthlyClimate[];
};

export abstract class ClimatologyProvider {
  abstract findMonthlyClimatology(coordinates: Coordinates): Promise<GridClimatology>;
}
