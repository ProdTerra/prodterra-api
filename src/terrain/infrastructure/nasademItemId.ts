import type { Coordinates } from '../domain/coordinates.js';

function formatDegrees(degrees: number, width: number): string {
  return String(Math.abs(degrees)).padStart(width, '0');
}

export function nasademItemId({ latitude, longitude }: Coordinates): string {
  const tileLatitude = Math.floor(latitude);
  const tileLongitude = Math.floor(longitude);
  const latitudeHemisphere = tileLatitude < 0 ? 's' : 'n';
  const longitudeHemisphere = tileLongitude < 0 ? 'w' : 'e';
  return `NASADEM_HGT_${latitudeHemisphere}${formatDegrees(tileLatitude, 2)}${longitudeHemisphere}${formatDegrees(tileLongitude, 3)}`;
}
