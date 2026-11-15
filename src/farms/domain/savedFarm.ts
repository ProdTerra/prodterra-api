export type SavedFarmSnapshot = Record<string, unknown>;

export type SavedFarm = {
  id: string;
  ownerId: string;
  name: string;
  lotCount: number;
  snapshot: SavedFarmSnapshot;
  createdAt: Date;
  updatedAt: Date;
};

export type SavedFarmSummary = Omit<SavedFarm, 'ownerId' | 'snapshot'>;

export type SavedFarmInput = {
  name: string;
  snapshot: SavedFarmSnapshot;
};

export type SavedFarmFieldError = { field: 'name' | 'snapshot'; code: string };

const maximumNameLength = 80;
const maximumLots = 30;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function lotCountOf(snapshot: SavedFarmSnapshot): number {
  return Array.isArray(snapshot.lots) ? snapshot.lots.length : 0;
}

export function validateSavedFarmInput(body: unknown): { input: SavedFarmInput } | { errors: SavedFarmFieldError[] } {
  const errors: SavedFarmFieldError[] = [];
  const record = isRecord(body) ? body : {};
  const name = typeof record.name === 'string' ? record.name.trim() : '';
  if (name.length === 0) {
    errors.push({ field: 'name', code: 'nameRequired' });
  } else if (name.length > maximumNameLength) {
    errors.push({ field: 'name', code: 'nameTooLong' });
  }
  const snapshot = record.snapshot;
  if (!isRecord(snapshot) || !isRecord(snapshot.farmBoundary) || !Array.isArray(snapshot.lots)) {
    errors.push({ field: 'snapshot', code: 'invalidSnapshot' });
  } else if (snapshot.lots.length === 0 || snapshot.lots.length > maximumLots) {
    errors.push({ field: 'snapshot', code: 'invalidLotCount' });
  }
  if (errors.length > 0 || !isRecord(snapshot)) {
    return { errors };
  }
  return { input: { name, snapshot } };
}
