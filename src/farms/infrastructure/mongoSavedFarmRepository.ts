import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, type Model } from 'mongoose';
import { lotCountOf, type SavedFarm, type SavedFarmInput, type SavedFarmSummary } from '../domain/savedFarm.js';
import { SavedFarmRepository } from '../domain/savedFarmRepository.js';
import { SavedFarmDocument } from './schemas/savedFarm.schema.js';

type StoredSavedFarm = SavedFarmDocument & { _id: { toString(): string } };

function toSavedFarm(document: StoredSavedFarm): SavedFarm {
  return {
    id: document._id.toString(),
    ownerId: document.ownerId,
    name: document.name,
    lotCount: document.lotCount,
    snapshot: document.snapshot,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

function toSummary(document: StoredSavedFarm): SavedFarmSummary {
  const { ownerId: _ownerId, snapshot: _snapshot, ...summary } = toSavedFarm(document);
  return summary;
}

@Injectable()
export class MongoSavedFarmRepository extends SavedFarmRepository {
  constructor(@InjectModel(SavedFarmDocument.name) private readonly savedFarmModel: Model<SavedFarmDocument>) {
    super();
  }

  async listByOwner(ownerId: string): Promise<SavedFarmSummary[]> {
    const documents = await this.savedFarmModel.find({ ownerId }).sort({ updatedAt: -1 }).lean<StoredSavedFarm[]>();
    return documents.map(toSummary);
  }

  async findOwned(ownerId: string, farmId: string): Promise<SavedFarm | null> {
    if (!isValidObjectId(farmId)) {
      return null;
    }
    const document = await this.savedFarmModel.findOne({ _id: farmId, ownerId }).lean<StoredSavedFarm>();
    return document ? toSavedFarm(document) : null;
  }

  async create(ownerId: string, input: SavedFarmInput, now: Date): Promise<SavedFarm> {
    const document = await this.savedFarmModel.create({
      ownerId,
      name: input.name,
      lotCount: lotCountOf(input.snapshot),
      snapshot: input.snapshot,
      createdAt: now,
      updatedAt: now,
    });
    return toSavedFarm(document.toObject() as StoredSavedFarm);
  }

  async updateOwned(ownerId: string, farmId: string, input: SavedFarmInput, now: Date): Promise<SavedFarm | null> {
    if (!isValidObjectId(farmId)) {
      return null;
    }
    const document = await this.savedFarmModel
      .findOneAndUpdate(
        { _id: farmId, ownerId },
        { name: input.name, lotCount: lotCountOf(input.snapshot), snapshot: input.snapshot, updatedAt: now },
        { new: true },
      )
      .lean<StoredSavedFarm>();
    return document ? toSavedFarm(document) : null;
  }

  async deleteOwned(ownerId: string, farmId: string): Promise<boolean> {
    if (!isValidObjectId(farmId)) {
      return false;
    }
    const result = await this.savedFarmModel.deleteOne({ _id: farmId, ownerId });
    return result.deletedCount === 1;
  }
}
