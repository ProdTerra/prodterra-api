import type { MonthKey } from './monthKeys.js';

export type IsoDate = string;

export type RotationBlockInput = { kind: 'crop'; cropKey: string; durationInDays: number } | { kind: 'rest'; durationInDays: number };

export type ScheduledBlock = {
  kind: 'crop' | 'rest';
  cropKey: string | null;
  durationInDays: number;
  startsOn: IsoDate;
  endsOn: IsoDate;
};

const millisecondsPerDay = 86_400_000;

function toTime(date: IsoDate): number {
  return Date.parse(`${date}T00:00:00Z`);
}

export function addDays(date: IsoDate, days: number): IsoDate {
  return new Date(toTime(date) + days * millisecondsPerDay).toISOString().slice(0, 10);
}

export function monthKeyOf(date: IsoDate): MonthKey {
  return date.slice(0, 7);
}

export function isBefore(first: IsoDate, second: IsoDate): boolean {
  return toTime(first) < toTime(second);
}

export function scheduleBlocks(startDate: IsoDate, blocks: RotationBlockInput[]): ScheduledBlock[] {
  let cursor = startDate;
  return blocks.map((block) => {
    const startsOn = cursor;
    cursor = addDays(startsOn, block.durationInDays);
    return {
      kind: block.kind,
      cropKey: block.kind === 'crop' ? block.cropKey : null,
      durationInDays: block.durationInDays,
      startsOn,
      endsOn: addDays(cursor, -1),
    };
  });
}

export function blockOnDate(blocks: ScheduledBlock[], date: IsoDate): ScheduledBlock | null {
  return blocks.find((block) => !isBefore(date, block.startsOn) && !isBefore(block.endsOn, date)) ?? null;
}
