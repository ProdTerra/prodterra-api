import { parseAllowedOrigins } from './allowedOrigins.js';

describe('parseAllowedOrigins', () => {
  it('accepts several origins separated by commas', () => {
    expect(parseAllowedOrigins('http://localhost:3000, https://prodterra.onrender.com')).toEqual([
      'http://localhost:3000',
      'https://prodterra.onrender.com',
    ]);
  });

  it('removes trailing slashes and empty entries', () => {
    expect(parseAllowedOrigins('https://prodterra.app/,,')).toEqual(['https://prodterra.app']);
  });

  it('falls back to the local web app when nothing is configured', () => {
    expect(parseAllowedOrigins(undefined)).toEqual(['http://localhost:3000']);
    expect(parseAllowedOrigins('  ')).toEqual(['http://localhost:3000']);
  });
});
