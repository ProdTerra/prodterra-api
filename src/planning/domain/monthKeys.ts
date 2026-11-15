export type MonthKey = string;

const monthsPerYear = 12;
const plantingDayOfMonth = 15;
const millisecondsPerDay = 86_400_000;

function toIndex(month: MonthKey): number {
  const [year, monthNumber] = month.split('-').map(Number);
  return year * monthsPerYear + (monthNumber - 1);
}

function fromIndex(index: number): MonthKey {
  const year = Math.floor(index / monthsPerYear);
  const monthNumber = (index % monthsPerYear) + 1;
  return `${year}-${String(monthNumber).padStart(2, '0')}`;
}

export function addMonths(month: MonthKey, count: number): MonthKey {
  return fromIndex(toIndex(month) + count);
}

export function monthsFrom(start: MonthKey, count: number): MonthKey[] {
  return Array.from({ length: count }, (_, offset) => addMonths(start, offset));
}

export function monthNumberOf(month: MonthKey): number {
  return Number(month.split('-')[1]);
}

export function monthsBetween(from: MonthKey, to: MonthKey): number {
  return toIndex(to) - toIndex(from);
}

export function harvestMonth(plantedOn: MonthKey, cycleLengthInDays: number): MonthKey {
  const [year, monthNumber] = plantedOn.split('-').map(Number);
  const planting = Date.UTC(year, monthNumber - 1, plantingDayOfMonth);
  const harvest = new Date(planting + cycleLengthInDays * millisecondsPerDay);
  return fromIndex(harvest.getUTCFullYear() * monthsPerYear + harvest.getUTCMonth());
}
