import type { Crop, DemandLevel, NutrientDemand } from '../../catalog/domain/crop.js';
import type { MonthlyClimate } from '../../climate/domain/monthlyClimate.js';
import { buildLotPlan } from './lotPlan.js';

const range = (minimum: number | null, maximum: number | null) => ({ minimum, maximum });

function crop(key: string, familyKey: string, demandLevel: DemandLevel, nutrients: NutrientDemand[], cycle: number | null): Crop {
  return {
    key,
    name: { es: key, en: key },
    scientificName: key,
    familyKey,
    demandLevel,
    nutrients,
    altitudeInMeters: range(1000, 3000),
    latitudeInDegrees: range(-45, 60),
    temperatureInCelsius: range(8, 24),
    waterNeedInMillimetersPerCycle: range(300, 500),
    relativeHumidityInPercent: range(60, 95),
    solarRadiationInKilowattHoursPerSquareMeterPerDay: range(3, 6),
    cycleLengthInDays: range(cycle, cycle),
    sources: [],
  };
}

const potato = crop('potato', 'solanaceae', 'high', [{ nutrient: 'K', level: 'high' }], 120);
const lettuce = crop('lettuce', 'asteraceae', 'low', [{ nutrient: 'N', level: 'low' }], 75);
const cabbage = crop('cabbage', 'brassicaceae', 'high', [{ nutrient: 'N', level: 'high' }], 112);
const mysteryCrop = crop('mystery', 'rosaceae', 'medium', [{ nutrient: 'K', level: 'medium' }], null);

const climate: MonthlyClimate[] = Array.from({ length: 12 }, (_, index) => ({
  month: index + 1,
  meanTemperatureInCelsius: 13,
  minimumTemperatureInCelsius: index === 0 ? 1.5 : 7,
  maximumTemperatureInCelsius: 20,
  relativeHumidityInPercent: 85,
  precipitationInMillimetersPerDay: 6,
  solarRadiationInKilowattHoursPerSquareMeterPerDay: 4.3,
}));

const baseInput = {
  lotId: 'lot-1',
  crops: [potato, lettuce, cabbage, mysteryCrop],
  pests: [],
  climate,
  lotElevationInMeters: 2150,
  startMonth: '2026-11',
  horizonInMonths: 12,
  hasIrrigation: true,
  previousUse: { kind: 'unknown' as const },
};

describe('buildLotPlan', () => {
  it('keeps the current crop until its estimated harvest and then plants the best next crop', () => {
    const plan = buildLotPlan({ ...baseInput, currentUse: { kind: 'crop', cropKey: 'potato', plantedOn: '2026-09' } });
    expect(plan.currentCrop).toEqual({ cropKey: 'potato', plantedOn: '2026-09', harvestMonth: '2027-01', cycleIsEstimated: false });
    expect(plan.months.slice(0, 3).map((month) => [month.month, month.cropKey, month.phase])).toEqual([
      ['2026-11', 'potato', 'current'],
      ['2026-12', 'potato', 'current'],
      ['2027-01', 'potato', 'current'],
    ]);
    expect(plan.nextCrop?.cropKey).toBe('lettuce');
    expect(plan.months[3]).toMatchObject({ month: '2027-02', cropKey: 'lettuce', phase: 'next' });
    expect(plan.recommendations).toHaveLength(3);
  });

  it('leaves a resting lot free until the recommended sowing month and then shows the new crop', () => {
    const plan = buildLotPlan({ ...baseInput, currentUse: { kind: 'fallow' }, previousUse: { kind: 'crop', cropKey: 'potato' } });
    expect(plan.currentCrop).toBeNull();
    const firstPlantedIndex = plan.months.findIndex((month) => month.phase === 'next');
    expect(plan.months[firstPlantedIndex]).toMatchObject({ month: plan.nextCrop?.sowMonth, cropKey: plan.nextCrop?.cropKey });
    expect(plan.months.slice(0, firstPlantedIndex).every((month) => month.phase === 'free')).toBe(true);
  });

  it('marks months after the next harvest as free', () => {
    const plan = buildLotPlan({ ...baseInput, currentUse: { kind: 'fallow' }, previousUse: { kind: 'crop', cropKey: 'potato' } });
    expect(plan.months.at(-1)?.phase).toBe('free');
  });

  it('carries the frost alert into the month status', () => {
    const plan = buildLotPlan({ ...baseInput, currentUse: { kind: 'crop', cropKey: 'potato', plantedOn: '2026-09' } });
    const january = plan.months.find((month) => month.month === '2027-01');
    expect(january?.status).toBe('risk');
    expect(january?.alerts[0]).toMatchObject({ type: 'frost' });
  });

  it('flags an estimated cycle when the catalog has no cycle for the current crop', () => {
    const plan = buildLotPlan({ ...baseInput, currentUse: { kind: 'crop', cropKey: 'mystery', plantedOn: '2026-10' } });
    expect(plan.currentCrop?.cycleIsEstimated).toBe(true);
  });

  it('treats a crop whose harvest already passed as harvested', () => {
    const plan = buildLotPlan({ ...baseInput, currentUse: { kind: 'crop', cropKey: 'lettuce', plantedOn: '2026-01' } });
    expect(plan.months.some((month) => month.phase === 'current')).toBe(false);
    expect(plan.currentCrop?.harvestMonth).toBe('2026-03');
  });
});
