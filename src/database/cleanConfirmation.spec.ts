import { isCleanConfirmed } from './cleanConfirmation.js';

describe('isCleanConfirmed', () => {
  it('only allows cleaning when --confirm is passed', () => {
    expect(isCleanConfirmed(['node', 'cleanDatabase.js', '--confirm'])).toBe(true);
    expect(isCleanConfirmed(['node', 'cleanDatabase.js'])).toBe(false);
    expect(isCleanConfirmed(['node', 'cleanDatabase.js', '--confirmed'])).toBe(false);
  });
});
