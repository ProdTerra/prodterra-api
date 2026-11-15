import type { Coordinates } from '../../terrain/domain/coordinates.js';

type Position = [number, number];

export type LotBoundary = {
  type: 'Polygon';
  coordinates: Position[][];
};

const minimumClosedRingLength = 4;
const coordinateDecimals = 6;

function isPosition(value: unknown): value is Position {
  if (!Array.isArray(value) || value.length < 2) {
    return false;
  }
  const [longitude, latitude] = value as unknown[];
  return (
    typeof longitude === 'number' &&
    typeof latitude === 'number' &&
    Math.abs(longitude) <= 180 &&
    Math.abs(latitude) <= 90
  );
}

function isClosedRing(value: unknown): value is Position[] {
  if (!Array.isArray(value) || value.length < minimumClosedRingLength || !value.every(isPosition)) {
    return false;
  }
  const first = value[0] as Position;
  const last = value[value.length - 1] as Position;
  return first[0] === last[0] && first[1] === last[1];
}

export function isLotBoundary(value: unknown): value is LotBoundary {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as { type?: unknown; coordinates?: unknown };
  return (
    candidate.type === 'Polygon' &&
    Array.isArray(candidate.coordinates) &&
    candidate.coordinates.length > 0 &&
    candidate.coordinates.every(isClosedRing)
  );
}

function roundCoordinate(value: number): number {
  const factor = 10 ** coordinateDecimals;
  return Math.round(value * factor) / factor;
}

export function centroidOf(boundary: LotBoundary): Coordinates {
  const outerRing = boundary.coordinates[0].slice(0, -1);
  const longitudeSum = outerRing.reduce((sum, [longitude]) => sum + longitude, 0);
  const latitudeSum = outerRing.reduce((sum, [, latitude]) => sum + latitude, 0);
  return {
    latitude: roundCoordinate(latitudeSum / outerRing.length),
    longitude: roundCoordinate(longitudeSum / outerRing.length),
  };
}
