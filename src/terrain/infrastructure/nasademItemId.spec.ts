import { nasademItemId } from './nasademItemId.js';

describe('nasademItemId', () => {
  it('names the tile that covers a point in the northern and western hemispheres', () => {
    expect(nasademItemId({ latitude: 9.918, longitude: -83.892 })).toBe('NASADEM_HGT_n09w084');
  });

  it('names the tile that covers a point in the southern and eastern hemispheres', () => {
    expect(nasademItemId({ latitude: -0.5, longitude: 10.2 })).toBe('NASADEM_HGT_s01e010');
  });

  it('uses the tile to the west when the longitude is just below zero', () => {
    expect(nasademItemId({ latitude: 45.1, longitude: -0.2 })).toBe('NASADEM_HGT_n45w001');
  });
});
