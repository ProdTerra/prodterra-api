import type { Pest } from '../domain/pest.js';
import { toFamilyResponse, toLocalizedNameResponse, toPestResponse } from './catalogResponses.js';

describe('catalog responses', () => {
  it('uses the Spanish name when there is no English name', () => {
    expect(toLocalizedNameResponse({ es: 'Cortadores' })).toEqual({ es: 'Cortadores', en: 'Cortadores' });
  });

  it('keeps an English name that exists', () => {
    expect(toLocalizedNameResponse({ es: 'Papa', en: 'Potato' })).toEqual({ es: 'Papa', en: 'Potato' });
  });

  it('completes the name of pests and families', () => {
    const pest: Pest = {
      key: 'cortadores',
      name: { es: 'Cortadores' },
      scientificName: null,
      type: 'pest',
      affectedFamilyKeys: ['solanaceae'],
      onlyAffectsCropKeys: [],
      sources: [],
    };
    expect(toPestResponse(pest)).toEqual({ ...pest, name: { es: 'Cortadores', en: 'Cortadores' } });
    expect(toFamilyResponse({ key: 'poaceae', scientificName: 'Poaceae', name: { es: 'Poaceae' }, sources: [] }).name).toEqual({
      es: 'Poaceae',
      en: 'Poaceae',
    });
  });
});
