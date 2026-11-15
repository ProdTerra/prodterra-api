const megajoulesPerKilowattHour = 3.6;

export function megajoulesToKilowattHours(megajoules: number): number {
  return Math.round((megajoules / megajoulesPerKilowattHour) * 100) / 100;
}
