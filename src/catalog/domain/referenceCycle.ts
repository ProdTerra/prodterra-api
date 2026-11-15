import type { Range } from './catalogValues.js';

export function referenceCycleInDays(cycle: Range): number | null {
  if (cycle.minimum === null || cycle.maximum === null) {
    return cycle.minimum ?? cycle.maximum;
  }
  return Math.round((cycle.minimum + cycle.maximum) / 2);
}
