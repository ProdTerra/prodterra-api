import { centroidOf, isLotBoundary } from './lotBoundary.js';

const square = {
  type: 'Polygon',
  coordinates: [
    [
      [-83.892, 9.918],
      [-83.89, 9.918],
      [-83.89, 9.92],
      [-83.892, 9.92],
      [-83.892, 9.918],
    ],
  ],
};

describe('isLotBoundary', () => {
  it('accepts a closed GeoJSON polygon', () => {
    expect(isLotBoundary(square)).toBe(true);
  });

  it('rejects shapes that are not closed polygons with valid coordinates', () => {
    expect(isLotBoundary({ type: 'Point', coordinates: [-83.892, 9.918] })).toBe(false);
    expect(isLotBoundary({ ...square, coordinates: [square.coordinates[0].slice(0, 4)] })).toBe(false);
    expect(isLotBoundary({ type: 'Polygon', coordinates: [[[-83.8, 95], [-83.7, 9], [-83.6, 9], [-83.8, 95]]] })).toBe(false);
    expect(isLotBoundary('not a polygon')).toBe(false);
  });
});

describe('centroidOf', () => {
  it('returns the center of the outer ring without counting the closing point twice', () => {
    expect(centroidOf(square as never)).toEqual({ latitude: 9.919, longitude: -83.891 });
  });
});
