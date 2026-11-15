import { validateEnvironment } from './environment.js';

describe('validateEnvironment', () => {
  it('accepts a MongoDB Atlas connection string', () => {
    const uri = 'mongodb+srv://cluster0.example.mongodb.net/prodterra';
    expect(validateEnvironment({ MONGODB_URI: uri }).MONGODB_URI).toBe(uri);
  });

  it('explains how to fix a missing connection string', () => {
    expect(() => validateEnvironment({})).toThrow(/Copy .env.example to .env/);
  });
});
