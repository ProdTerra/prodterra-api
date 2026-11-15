import { addMonths, harvestMonth, monthNumberOf, monthsFrom } from './monthKeys.js';

describe('month keys', () => {
  it('lists the months of the plan starting with the current one', () => {
    expect(monthsFrom('2026-11', 3)).toEqual(['2026-11', '2026-12', '2027-01']);
  });

  it('adds months across years', () => {
    expect(addMonths('2026-11', 14)).toBe('2028-01');
  });

  it('reads the calendar month number', () => {
    expect(monthNumberOf('2027-03')).toBe(3);
  });

  it('estimates the harvest month assuming the crop was planted in the middle of its month', () => {
    expect(harvestMonth('2026-08', 120)).toBe('2026-12');
    expect(harvestMonth('2026-08', 112)).toBe('2026-12');
    expect(harvestMonth('2026-08', 100)).toBe('2026-11');
    expect(harvestMonth('2026-01', 180)).toBe('2026-07');
  });
});
