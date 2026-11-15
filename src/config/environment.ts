type Environment = {
  MONGODB_URI: string;
  PORT?: string;
  WEB_ORIGIN?: string;
};

export function validateEnvironment(variables: Record<string, unknown>): Environment {
  const mongodbUri = variables.MONGODB_URI;
  if (typeof mongodbUri !== 'string' || !/^mongodb(\+srv)?:\/\//.test(mongodbUri)) {
    throw new Error('MONGODB_URI is missing or invalid. Copy .env.example to .env and paste the MongoDB Atlas connection string.');
  }
  return {
    MONGODB_URI: mongodbUri,
    PORT: typeof variables.PORT === 'string' ? variables.PORT : undefined,
    WEB_ORIGIN: typeof variables.WEB_ORIGIN === 'string' ? variables.WEB_ORIGIN : undefined,
  };
}
