import { validateEnvironment } from './environment.js';

const atlasUri = 'mongodb+srv://cluster0.example.mongodb.net/?retryWrites=true';

describe('validateEnvironment', () => {
  it('accepts a MongoDB Atlas connection string and a database name', () => {
    const environment = validateEnvironment({ MONGODB_URI: atlasUri, DB_NAME: 'prodterra-dev' });
    expect(environment.MONGODB_URI).toBe(atlasUri);
    expect(environment.DB_NAME).toBe('prodterra-dev');
  });

  it('explains how to fix a missing connection string', () => {
    expect(() => validateEnvironment({ DB_NAME: 'prodterra' })).toThrow(/Copy .env.example to .env/);
  });

  it('requires the database name so data never lands in the wrong database', () => {
    expect(() => validateEnvironment({ MONGODB_URI: atlasUri })).toThrow(/DB_NAME/);
  });

  it('rejects database names MongoDB does not allow', () => {
    for (const invalidName of ['prod terra', 'prod/terra', 'prod.terra', '']) {
      expect(() => validateEnvironment({ MONGODB_URI: atlasUri, DB_NAME: invalidName })).toThrow(/DB_NAME/);
    }
  });
});
