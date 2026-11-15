import type { Crop } from '../../catalog/domain/crop.js';
import type { Pest } from '../../catalog/domain/pest.js';
import type { MonthlyClimate } from '../../climate/domain/monthlyClimate.js';
import { assessMonth } from './monthlyAssessment.js';

const range = (minimum: number | null, maximum: number | null) => ({ minimum, maximum });

const potato: Crop = {
  key: 'potato',
  name: { es: 'Papa', en: 'Potato' },
  scientificName: 'Solanum tuberosum',
  familyKey: 'solanaceae',
  demandLevel: 'high',
  nutrients: [{ nutrient: 'K', level: 'high' }],
  altitudeInMeters: range(1500, 3200),
  temperatureInCelsius: range(8, 22),
  waterNeedInMillimetersPerCycle: range(500, 700),
  relativeHumidityInPercent: range(70, 90),
  solarRadiationInKilowattHoursPerSquareMeterPerDay: range(3.5, 6),
  cycleLengthInDays: range(120, 120),
  sources: [],
};

const lateBlight: Pest = {
  key: 'late-blight',
  name: { es: 'Tizón tardío', en: 'Late blight' },
  scientificName: 'Phytophthora infestans',
  type: 'oomycete',
  temperatureInCelsius: range(10, 25),
  relativeHumidityInPercent: range(90, 100),
  affectedFamilyKeys: ['solanaceae'],
  onlyAffectsCropKeys: [],
  sources: [],
};

function climate(overrides: Partial<MonthlyClimate>): MonthlyClimate {
  return {
    month: 6,
    meanTemperatureInCelsius: 13.8,
    minimumTemperatureInCelsius: 7.3,
    maximumTemperatureInCelsius: 20.5,
    relativeHumidityInPercent: 85,
    precipitationInMillimetersPerDay: 5,
    solarRadiationInKilowattHoursPerSquareMeterPerDay: 4.3,
    ...overrides,
  };
}

describe('assessMonth', () => {
  it('is fine when the climate suits the crop and no pest is active', () => {
    expect(assessMonth({ crop: potato, pests: [lateBlight], climate: climate({}), hasIrrigation: true })).toEqual({
      status: 'ok',
      alerts: [],
    });
  });

  it('marks frost risk when the average night falls below 2 °C', () => {
    const assessment = assessMonth({
      crop: potato,
      pests: [],
      climate: climate({ minimumTemperatureInCelsius: 1.4 }),
      hasIrrigation: true,
    });
    expect(assessment.status).toBe('risk');
    expect(assessment.alerts).toContainEqual({ type: 'frost', level: 'risk', minimumTemperatureInCelsius: 1.4 });
  });

  it('warns about a pest when the month falls inside its temperature and humidity ranges', () => {
    const assessment = assessMonth({
      crop: potato,
      pests: [lateBlight],
      climate: climate({ relativeHumidityInPercent: 92 }),
      hasIrrigation: true,
    });
    expect(assessment.status).toBe('watch');
    expect(assessment.alerts).toContainEqual({ type: 'pest', level: 'watch', pestKey: 'late-blight' });
  });

  it('recommends irrigation when rain is below the monthly water need and the lot has irrigation', () => {
    const assessment = assessMonth({
      crop: potato,
      pests: [],
      climate: climate({ precipitationInMillimetersPerDay: 2.5, month: 3 }),
      hasIrrigation: true,
    });
    expect(assessment.status).toBe('watch');
    expect(assessment.alerts).toContainEqual({ type: 'irrigation', level: 'watch', litersPerSquareMeter: 52 });
  });

  it('marks a water deficit as risk when the lot has no irrigation', () => {
    const assessment = assessMonth({
      crop: potato,
      pests: [],
      climate: climate({ precipitationInMillimetersPerDay: 2.5, month: 3 }),
      hasIrrigation: false,
    });
    expect(assessment.alerts).toContainEqual({ type: 'drought', level: 'risk', litersPerSquareMeter: 52 });
  });

  it('warns about water excess when rain goes above the maximum water need of the crop', () => {
    const assessment = assessMonth({
      crop: potato,
      pests: [],
      climate: climate({ precipitationInMillimetersPerDay: 10, month: 6 }),
      hasIrrigation: false,
    });
    expect(assessment.alerts).toContainEqual({ type: 'waterExcess', level: 'watch', litersPerSquareMeter: 125 });
    expect(assessment.alerts.some((alert) => alert.type === 'drought')).toBe(false);
  });

  it('raises no water alert when rain stays between the minimum and maximum water need', () => {
    const assessment = assessMonth({
      crop: potato,
      pests: [],
      climate: climate({ precipitationInMillimetersPerDay: 5, month: 6 }),
      hasIrrigation: false,
    });
    expect(assessment.alerts.filter((alert) => ['drought', 'irrigation', 'waterExcess'].includes(alert.type))).toEqual([]);
  });

  it('marks months warmer or colder than the crop range as risk', () => {
    const assessment = assessMonth({
      crop: potato,
      pests: [],
      climate: climate({ meanTemperatureInCelsius: 25 }),
      hasIrrigation: true,
    });
    expect(assessment.alerts).toContainEqual({ type: 'temperature', level: 'risk', meanTemperatureInCelsius: 25 });
  });

  it('only warns about frost on a free lot', () => {
    expect(
      assessMonth({ crop: null, pests: [lateBlight], climate: climate({ relativeHumidityInPercent: 95 }), hasIrrigation: false }),
    ).toEqual({ status: 'ok', alerts: [] });
  });
});
