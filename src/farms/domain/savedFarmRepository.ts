import type { SavedFarm, SavedFarmInput, SavedFarmSummary } from './savedFarm.js';

export abstract class SavedFarmRepository {
  abstract listByOwner(ownerId: string): Promise<SavedFarmSummary[]>;
  abstract findOwned(ownerId: string, farmId: string): Promise<SavedFarm | null>;
  abstract create(ownerId: string, input: SavedFarmInput, now: Date): Promise<SavedFarm>;
  abstract updateOwned(ownerId: string, farmId: string, input: SavedFarmInput, now: Date): Promise<SavedFarm | null>;
  abstract deleteOwned(ownerId: string, farmId: string): Promise<boolean>;
}
