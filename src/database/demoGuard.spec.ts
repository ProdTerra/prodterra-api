import { isDemoDatabase } from './demoGuard.js';

describe('isDemoDatabase', () => {
  it('allows databases meant for development, tests or demos', () => {
    expect(isDemoDatabase('prodterra-dev')).toBe(true);
    expect(isDemoDatabase('prodterra-test')).toBe(true);
    expect(isDemoDatabase('prodterra-demo')).toBe(true);
    expect(isDemoDatabase('development')).toBe(true);
    expect(isDemoDatabase('prodterra_development')).toBe(true);
    expect(isDemoDatabase('test')).toBe(true);
  });

  it('refuses the production database and any other name', () => {
    expect(isDemoDatabase('prodterra')).toBe(false);
    expect(isDemoDatabase('prodterra-dev-copy')).toBe(false);
    expect(isDemoDatabase('production')).toBe(false);
    expect(isDemoDatabase('devops')).toBe(false);
  });
});
