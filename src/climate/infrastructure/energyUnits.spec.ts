import { megajoulesToKilowattHours } from './energyUnits.js';

describe('megajoulesToKilowattHours', () => {
  it('converts NASA POWER radiation from MJ to kWh with two decimals', () => {
    expect(megajoulesToKilowattHours(16.41)).toBe(4.56);
  });
});
