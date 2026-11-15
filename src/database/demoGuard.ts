const demoDatabaseName = /(^|[-_])(dev|development|test|demo)$/;

export function isDemoDatabase(databaseName: string): boolean {
  return demoDatabaseName.test(databaseName);
}
