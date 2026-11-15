export const avatarKeys = Array.from({ length: 10 }, (_, index) => `farmer-${String(index + 1).padStart(2, '0')}`);

export function isAvatarKey(value: unknown): value is string {
  return typeof value === 'string' && avatarKeys.includes(value);
}

export function randomAvatarKey(random: () => number = Math.random): string {
  return avatarKeys[Math.floor(random() * avatarKeys.length)];
}
