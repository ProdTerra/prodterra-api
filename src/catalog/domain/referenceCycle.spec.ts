import { referenceCycleInDays } from './referenceCycle.js';

describe('referenceCycleInDays', () => {
  it('uses the single value of a fixed cycle', () => {
    expect(referenceCycleInDays({ minimum: 120, maximum: 120 })).toBe(120);
  });

  it('uses the rounded middle of a cycle range', () => {
    expect(referenceCycleInDays({ minimum: 60, maximum: 91 })).toBe(76);
  });

  it('uses the only known bound of a half-known cycle', () => {
    expect(referenceCycleInDays({ minimum: 90, maximum: null })).toBe(90);
  });

  it('has no reference when the cycle is unknown', () => {
    expect(referenceCycleInDays({ minimum: null, maximum: null })).toBeNull();
  });
});
