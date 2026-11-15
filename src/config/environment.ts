type Environment = {
  MONGODB_URI: string;
  DB_NAME: string;
  PORT?: string;
  WEB_ORIGIN?: string;
};

const databaseNamePattern = /^[A-Za-z0-9_-]{1,63}$/;

export function validateEnvironment(variables: Record<string, unknown>): Environment {
  const mongodbUri = variables.MONGODB_URI;
  if (typeof mongodbUri !== 'string' || !/^mongodb(\+srv)?:\/\//.test(mongodbUri)) {
    throw new Error('MONGODB_URI is missing or invalid. Copy .env.example to .env and paste the MongoDB Atlas connection string.');
  }
  const databaseName = variables.DB_NAME;
  if (typeof databaseName !== 'string' || !databaseNamePattern.test(databaseName)) {
    throw new Error(
      'DB_NAME is missing or invalid. Use letters, numbers, "-" or "_" (for example prodterra-dev locally and prodterra in production).',
    );
  }
  return {
    MONGODB_URI: mongodbUri,
    DB_NAME: databaseName,
    PORT: typeof variables.PORT === 'string' ? variables.PORT : undefined,
    WEB_ORIGIN: typeof variables.WEB_ORIGIN === 'string' ? variables.WEB_ORIGIN : undefined,
  };
}
