import { safeReturnPath } from './returnPath.js';

describe('safeReturnPath', () => {
  it('keeps relative paths inside the app', () => {
    expect(safeReturnPath('/farms')).toBe('/farms');
    expect(safeReturnPath('/?step=plan')).toBe('/?step=plan');
  });

  it('falls back to the home page for anything that could leave the app', () => {
    for (const value of ['https://evil.example', '//evil.example', '/\\evil.example', 'farms', undefined, 42]) {
      expect(safeReturnPath(value)).toBe('/');
    }
  });
});
