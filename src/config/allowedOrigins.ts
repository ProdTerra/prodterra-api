const localWebOrigin = 'http://localhost:3000';

export function parseAllowedOrigins(configuredOrigins: string | undefined): string[] {
  const origins = (configuredOrigins ?? '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter((origin) => origin.length > 0);
  return origins.length > 0 ? origins : [localWebOrigin];
}
