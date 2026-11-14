import { ValidateBy } from 'class-validator';
import { isLotBoundary, type LotBoundary } from '../domain/lotBoundary.js';

export class LotClimateProfileRequestDto {
  @ValidateBy({
    name: 'isLotBoundary',
    validator: {
      validate: (value: unknown) => isLotBoundary(value),
      defaultMessage: () => 'boundary must be a closed GeoJSON Polygon with longitude and latitude positions',
    },
  })
  boundary!: LotBoundary;
}
