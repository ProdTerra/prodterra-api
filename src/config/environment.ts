type Environment = {
  MONGODB_URI: string;
  DB_NAME: string;
  PORT?: string;
  WEB_ORIGIN?: string;
  SESSION_COOKIE_DOMAIN?: string;
  WEB_APP_URL?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GOOGLE_CALLBACK_URL?: string;
  GMAIL_USER?: string;
  GMAIL_APP_PASSWORD?: string;
};

const optionalVariableNames = [
  'WEB_APP_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_CALLBACK_URL',
  'GMAIL_USER',
  'GMAIL_APP_PASSWORD',
] as const;

const databaseNamePattern = /^[A-Za-z0-9_-]{1,63}$/;
const cookieDomainPattern = /^\.?[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*$/;

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
    SESSION_COOKIE_DOMAIN: readSessionCookieDomain(variables.SESSION_COOKIE_DOMAIN),
    ...readOptionalVariables(variables),
  };
}

function readSessionCookieDomain(value: unknown): string | undefined {
  if (value === undefined || value === '') {
    return undefined;
  }
  if (typeof value !== 'string' || !cookieDomainPattern.test(value)) {
    throw new Error('SESSION_COOKIE_DOMAIN is invalid. Leave it empty or use a domain such as prodterra.example.com.');
  }
  return value;
}

function readOptionalVariables(variables: Record<string, unknown>): Partial<Environment> {
  const values: Partial<Environment> = {};
  for (const name of optionalVariableNames) {
    const value = variables[name];
    if (typeof value === 'string' && value.trim() !== '') {
      values[name] = value.trim();
    }
  }
  for (const name of ['WEB_APP_URL', 'GOOGLE_CALLBACK_URL'] as const) {
    if (values[name] !== undefined && !URL.canParse(values[name])) {
      throw new Error(`${name} must be a full URL such as http://localhost:3000.`);
    }
  }
  return values;
}
