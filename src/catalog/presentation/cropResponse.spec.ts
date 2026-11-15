import type { Crop } from '../domain/crop.js';
import { toCropResponse } from './cropResponse.js';

const unknown = { minimum: null, maximum: null };

const potato: Crop = {
  key: 'potato',
  name: { es: 'Papa', en: 'Potato' },
  scientificName: 'Solanum tuberosum',
  familyKey: 'solanaceae',
  demandLevel: 'high',
  nutrients: [],
  altitudeInMeters: unknown,
  temperatureInCelsius: unknown,
  waterNeedInMillimetersPerCycle: unknown,
  relativeHumidityInPercent: unknown,
  solarRadiationInKilowattHoursPerSquareMeterPerDay: unknown,
  cycleLengthInDays: { minimum: 120, maximum: 120 },
  sources: [],
};

describe('toCropResponse', () => {
  it('adds the reference cycle the farmer sees as the default duration', () => {
    expect(toCropResponse(potato)).toEqual({ ...potato, referenceCycleInDays: 120 });
  });

  it('keeps the reference cycle empty when the cycle is unknown', () => {
    expect(toCropResponse({ ...potato, cycleLengthInDays: unknown }).referenceCycleInDays).toBeNull();
  });

  it('falls back to the Spanish name when the crop has no English name', () => {
    expect(toCropResponse({ ...potato, name: { es: 'Papa' } }).name).toEqual({ es: 'Papa', en: 'Papa' });
  });
});
