const maximumReturnPathLength = 512;

export function safeReturnPath(value: unknown): string {
  if (typeof value !== 'string' || value.length > maximumReturnPathLength) {
    return '/';
  }
  const isRelativePath = value.startsWith('/') && !value.startsWith('//') && !value.includes('\\');
  return isRelativePath ? value : '/';
}
