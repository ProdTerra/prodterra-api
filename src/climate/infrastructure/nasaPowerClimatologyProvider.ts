import { Injectable } from '@nestjs/common';
import type { Coordinates } from '../../terrain/domain/coordinates.js';
import { ClimatologyProvider, type GridClimatology } from '../domain/climatologyProvider.js';
import type { MonthlyClimate } from '../domain/monthlyClimate.js';
import { megajoulesToKilowattHours } from './energyUnits.js';

type MonthKey = 'JAN' | 'FEB' | 'MAR' | 'APR' | 'MAY' | 'JUN' | 'JUL' | 'AUG' | 'SEP' | 'OCT' | 'NOV' | 'DEC';
type ParameterName = 'T2M' | 'T2M_MIN' | 'T2M_MAX' | 'RH2M' | 'PRECTOTCORR' | 'ALLSKY_SFC_SW_DWN';
type PowerClimatologyResponse = {
  geometry?: { coordinates?: number[] };
  properties?: { parameter?: Partial<Record<ParameterName, Partial<Record<MonthKey, number>>>> };
};

const climatologyEndpoint = 'https://power.larc.nasa.gov/api/temporal/climatology/point';
const parameterNames: ParameterName[] = ['T2M', 'T2M_MIN', 'T2M_MAX', 'RH2M', 'PRECTOTCORR', 'ALLSKY_SFC_SW_DWN'];
const monthKeys: MonthKey[] = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const missingValue = -999;
const requestTimeoutInMilliseconds = 15_000;

function readValue(response: PowerClimatologyResponse, parameter: ParameterName, month: MonthKey): number {
  const value = response.properties?.parameter?.[parameter]?.[month];
  if (typeof value !== 'number' || value === missingValue) {
    throw new Error(`NASA POWER has no ${parameter} value for ${month}`);
  }
  return value;
}

function toMonthlyClimate(response: PowerClimatologyResponse, month: MonthKey, index: number): MonthlyClimate {
  return {
    month: index + 1,
    meanTemperatureInCelsius: readValue(response, 'T2M', month),
    minimumTemperatureInCelsius: readValue(response, 'T2M_MIN', month),
    maximumTemperatureInCelsius: readValue(response, 'T2M_MAX', month),
    relativeHumidityInPercent: readValue(response, 'RH2M', month),
    precipitationInMillimetersPerDay: readValue(response, 'PRECTOTCORR', month),
    solarRadiationInKilowattHoursPerSquareMeterPerDay: megajoulesToKilowattHours(
      readValue(response, 'ALLSKY_SFC_SW_DWN', month),
    ),
  };
}

@Injectable()
export class NasaPowerClimatologyProvider extends ClimatologyProvider {
  async findMonthlyClimatology(coordinates: Coordinates): Promise<GridClimatology> {
    const url = new URL(climatologyEndpoint);
    url.search = new URLSearchParams({
      parameters: parameterNames.join(','),
      community: 'AG',
      latitude: String(coordinates.latitude),
      longitude: String(coordinates.longitude),
      format: 'JSON',
    }).toString();

    const response = await fetch(url, { signal: AbortSignal.timeout(requestTimeoutInMilliseconds) });
    if (!response.ok) {
      throw new Error(`NASA POWER climatology request failed with status ${response.status}`);
    }
    const body = (await response.json()) as PowerClimatologyResponse;
    const gridElevation = body.geometry?.coordinates?.[2];
    if (typeof gridElevation !== 'number') {
      throw new Error('NASA POWER response has no grid elevation');
    }
    return {
      gridElevationInMeters: gridElevation,
      months: monthKeys.map((month, index) => toMonthlyClimate(body, month, index)),
    };
  }
}
