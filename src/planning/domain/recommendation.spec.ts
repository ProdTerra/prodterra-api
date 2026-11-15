import type { Crop, DemandLevel, NutrientDemand } from '../../catalog/domain/crop.js';
import type { MonthlyClimate } from '../../climate/domain/monthlyClimate.js';
import { recommendNextCrops } from './recommendation.js';

const range = (minimum: number | null, maximum: number | null) => ({ minimum, maximum });

function crop(key: string, familyKey: string, demandLevel: DemandLevel, nutrients: NutrientDemand[], altitude = range(1000, 3000)): Crop {
  return {
    key,
    name: { es: key, en: key },
    scientificName: key,
    familyKey,
    demandLevel,
    nutrients,
    altitudeInMeters: altitude,
    temperatureInCelsius: range(8, 24),
    waterNeedInMillimetersPerCycle: range(300, 500),
    relativeHumidityInPercent: range(60, 95),
    solarRadiationInKilowattHoursPerSquareMeterPerDay: range(3, 6),
    cycleLengthInDays: range(90, 120),
    sources: [],
  };
}

const potato = crop('potato', 'solanaceae', 'high', [{ nutrient: 'K', level: 'high' }]);
const tomato = crop('tomato', 'solanaceae', 'high', [{ nutrient: 'K', level: 'high' }]);
const lettuce = crop('lettuce', 'asteraceae', 'low', [{ nutrient: 'N', level: 'low' }]);
const cabbage = crop('cabbage', 'brassicaceae', 'high', [{ nutrient: 'N', level: 'high' }]);
const lowlandCrop = crop('chayote', 'cucurbitaceae', 'medium', [{ nutrient: 'K', level: 'medium' }], range(500, 1500));

const mildClimate: MonthlyClimate[] = Array.from({ length: 12 }, (_, index) => ({
  month: index + 1,
  meanTemperatureInCelsius: 13,
  minimumTemperatureInCelsius: 7,
  maximumTemperatureInCelsius: 20,
  relativeHumidityInPercent: 85,
  precipitationInMillimetersPerDay: 6,
  solarRadiationInKilowattHoursPerSquareMeterPerDay: 4.3,
}));

const baseInput = {
  candidates: [potato, tomato, lettuce, cabbage, lowlandCrop],
  pests: [],
  climate: mildClimate,
  lotElevationInMeters: 2150,
  sowMonth: '2026-12',
  hasIrrigation: true,
  previousUse: { kind: 'unknown' as const },
};

describe('recommendNextCrops', () => {
  it('never puts the same family right after the current crop at the top', () => {
    const recommendations = recommendNextCrops({ ...baseInput, lastCrop: potato });
    expect(recommendations[0].cropKey).not.toBe('potato');
    expect(recommendations[0].cropKey).not.toBe('tomato');
    const tomatoRecommendation = recommendations.find((recommendation) => recommendation.cropKey === 'tomato');
    expect(tomatoRecommendation?.reasons).toContainEqual({ type: 'sameFamily', familyKey: 'solanaceae', positive: false });
  });

  it('prefers a low demand crop after a high demand one', () => {
    const recommendations = recommendNextCrops({ ...baseInput, lastCrop: potato });
    expect(recommendations[0].cropKey).toBe('lettuce');
    expect(recommendations[0].reasons).toContainEqual({ type: 'restAfterHighDemand', positive: true });
    expect(recommendations[0].reasons).toContainEqual({ type: 'differentNutrient', nutrient: 'N', positive: true });
  });

  it('flags crops that do not fit the lot elevation', () => {
    const recommendations = recommendNextCrops({ ...baseInput, lastCrop: potato });
    const chayote = recommendations.find((recommendation) => recommendation.cropKey === 'chayote');
    expect(chayote?.reasons).toContainEqual({ type: 'altitudeOutOfRange', positive: false });
    expect(recommendations.at(-1)?.cropKey).toBe('chayote');
  });

  it('compares with the previous crop when the lot is resting now', () => {
    const recommendations = recommendNextCrops({
      ...baseInput,
      lastCrop: null,
      previousUse: { kind: 'crop', cropKey: 'cabbage' },
    });
    const cabbageRecommendation = recommendations.find((recommendation) => recommendation.cropKey === 'cabbage');
    expect(cabbageRecommendation?.reasons).toContainEqual({ type: 'sameFamily', familyKey: 'brassicaceae', positive: false });
  });

  it('says when there is no previous crop to compare with', () => {
    const recommendations = recommendNextCrops({ ...baseInput, lastCrop: null });
    expect(recommendations[0].reasons).toContainEqual({ type: 'unknownHistory', positive: false });
  });

  it('counts the months where the climate suits the crop during its cycle', () => {
    const recommendations = recommendNextCrops({ ...baseInput, lastCrop: potato });
    expect(recommendations[0].reasons).toContainEqual({ type: 'climateFit', suitableMonths: 4, totalMonths: 4, positive: true });
  });
});

describe('choosing when to sow', () => {
  const drySeasonClimate: MonthlyClimate[] = mildClimate.map((month) => ({
    ...month,
    precipitationInMillimetersPerDay: month.month >= 1 && month.month <= 4 ? 0.5 : 8,
  }));

  it('waits for the rains when sowing right away would face a dry season without irrigation', () => {
    const recommendations = recommendNextCrops({
      ...baseInput,
      climate: drySeasonClimate,
      hasIrrigation: false,
      sowMonth: '2027-02',
      lastCrop: potato,
    });
    const lettuceRecommendation = recommendations.find((recommendation) => recommendation.cropKey === 'lettuce');
    expect(lettuceRecommendation?.sowMonth).toBe('2027-05');
    expect(lettuceRecommendation?.reasons).toContainEqual({ type: 'waitForBetterMonth', months: 3, positive: true });
  });

  it('sows right away when the climate already suits the crop', () => {
    const recommendations = recommendNextCrops({ ...baseInput, lastCrop: potato });
    expect(recommendations[0].sowMonth).toBe('2026-12');
    expect(recommendations[0].reasons.some((reason) => reason.type === 'waitForBetterMonth')).toBe(false);
  });
});
