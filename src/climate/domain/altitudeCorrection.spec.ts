import { correctMonthForAltitude, temperatureCorrectionInCelsius } from './altitudeCorrection.js';

describe('temperatureCorrectionInCelsius', () => {
  it('cools 6.5 degrees per 1000 meters above the climate grid', () => {
    expect(temperatureCorrectionInCelsius(1065, 2155)).toBeCloseTo(-7.085, 3);
  });

  it('warms a lot that is lower than the climate grid', () => {
    expect(temperatureCorrectionInCelsius(1500, 1000)).toBeCloseTo(3.25, 3);
  });
});

describe('correctMonthForAltitude', () => {
  it('corrects temperatures and keeps humidity, rain and radiation as given', () => {
    const month = {
      month: 1,
      meanTemperatureInCelsius: 19.1,
      minimumTemperatureInCelsius: 12.4,
      maximumTemperatureInCelsius: 26.0,
      relativeHumidityInPercent: 90,
      precipitationInMillimetersPerDay: 3.8,
      solarRadiationInKilowattHoursPerSquareMeterPerDay: 4.5,
    };
    expect(correctMonthForAltitude(month, -7.1)).toEqual({
      ...month,
      meanTemperatureInCelsius: 12.0,
      minimumTemperatureInCelsius: 5.3,
      maximumTemperatureInCelsius: 18.9,
    });
  });
});
