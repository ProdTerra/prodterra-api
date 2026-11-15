export type MonthlyClimate = {
  month: number;
  meanTemperatureInCelsius: number;
  minimumTemperatureInCelsius: number;
  maximumTemperatureInCelsius: number;
  relativeHumidityInPercent: number;
  precipitationInMillimetersPerDay: number;
  solarRadiationInKilowattHoursPerSquareMeterPerDay: number;
};
