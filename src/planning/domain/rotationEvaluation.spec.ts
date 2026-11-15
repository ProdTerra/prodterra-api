import type { Crop } from '../../catalog/domain/crop.js';
import type { MonthlyClimate } from '../../climate/domain/monthlyClimate.js';
import { evaluateRotation, recommendRotation, type RotationContext } from './rotationEvaluation.js';
import { parseRotationEvaluationRequest } from './rotationEvaluationRequest.js';

const range = (minimum: number, maximum: number) => ({ minimum, maximum });

function crop(key: string, familyKey: string, cycle: number): Crop {
  return {
    key,
    name: { es: key, en: key },
    scientificName: key,
    familyKey,
    demandLevel: 'medium',
    nutrients: [],
    altitudeInMeters: range(1000, 3000),
    latitudeInDegrees: range(-60, 60),
    temperatureInCelsius: range(8, 26),
    waterNeedInMillimetersPerCycle: range(300, 1200),
    relativeHumidityInPercent: range(40, 95),
    solarRadiationInKilowattHoursPerSquareMeterPerDay: range(2, 8),
    cycleLengthInDays: range(cycle, cycle),
    sources: [],
  };
}

const mildMonth = (month: number): MonthlyClimate => ({
  month,
  meanTemperatureInCelsius: 16,
  minimumTemperatureInCelsius: 9,
  maximumTemperatureInCelsius: 23,
  relativeHumidityInPercent: 80,
  precipitationInMillimetersPerDay: 6,
  solarRadiationInKilowattHoursPerSquareMeterPerDay: 4.5,
});

const context: RotationContext = {
  crops: [crop('potato', 'solanaceae', 120), crop('tomato', 'solanaceae', 180), crop('carrot', 'apiaceae', 180)],
  pests: [],
  climate: Array.from({ length: 12 }, (_, index) => mildMonth(index + 1)),
  lotElevationInMeters: 2100,
  hasIrrigation: false,
  previousUse: { kind: 'unknown' },
};

describe('evaluateRotation', () => {
  it('schedules the farmer blocks and warns about a short cycle and the same family in a row', () => {
    const rotation = evaluateRotation(
      '2026-11-15',
      [
        { kind: 'crop', cropKey: 'potato', durationInDays: 60 },
        { kind: 'rest', durationInDays: 30 },
        { kind: 'crop', cropKey: 'tomato', durationInDays: 180 },
      ],
      context,
    );
    expect(rotation.blocks.map((block) => [block.startsOn, block.endsOn])).toEqual([
      ['2026-11-15', '2027-01-13'],
      ['2027-01-14', '2027-02-12'],
      ['2027-02-13', '2027-08-11'],
    ]);
    expect(rotation.warnings).toEqual([
      { type: 'shorterThanReference', blockIndex: 0, durationInDays: 60, referenceCycleInDays: 120 },
      { type: 'sameFamilyInARow', blockIndex: 2, familyKey: 'solanaceae' },
    ]);
    expect(rotation.months[0]).toMatchObject({ month: '2026-11', cropKey: 'potato', status: 'ok' });
  });
});

describe('recommendRotation', () => {
  it('fills the same horizon without repeating a family back to back', () => {
    const rotation = recommendRotation('2026-11-15', '2027-11-14', { ...context, previousUse: { kind: 'crop', cropKey: 'potato' } });
    const cropKeys = rotation.blocks.filter((block) => block.kind === 'crop').map((block) => block.cropKey);
    expect(cropKeys[0]).toBe('carrot');
    expect(rotation.warnings.filter((warning) => warning.type === 'sameFamilyInARow')).toEqual([]);
  });
});

describe('parseRotationEvaluationRequest', () => {
  const boundary = { type: 'Polygon', coordinates: [[[-83.9, 9.9], [-83.89, 9.9], [-83.89, 9.91], [-83.9, 9.9]]] };
  const lot = { lotId: 'a', boundary, previousUse: { kind: 'unknown' }, hasIrrigation: false, blocks: [{ kind: 'crop', cropKey: 'potato', durationInDays: 120 }] };
  const today = new Date('2026-11-15T12:00:00Z');

  it('accepts a start date from today and lots with valid blocks', () => {
    expect(parseRotationEvaluationRequest({ startDate: '2026-11-15', lots: [lot] }, today).valid).toBe(true);
  });

  it('rejects past start dates and blocks shorter than two weeks', () => {
    expect(parseRotationEvaluationRequest({ startDate: '2026-10-01', lots: [lot] }, today).valid).toBe(false);
    const shortBlock = { ...lot, blocks: [{ kind: 'rest', durationInDays: 7 }] };
    expect(parseRotationEvaluationRequest({ startDate: '2026-11-15', lots: [shortBlock] }, today).valid).toBe(false);
  });
});
