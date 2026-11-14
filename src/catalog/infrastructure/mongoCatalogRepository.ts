import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { CatalogRepository } from '../domain/catalogRepository.js';
import type { Crop } from '../domain/crop.js';
import type { Pest } from '../domain/pest.js';
import type { PlantFamily } from '../domain/plantFamily.js';
import { CropDocument } from './schemas/crop.schema.js';
import { PestDocument } from './schemas/pest.schema.js';
import { PlantFamilyDocument } from './schemas/plantFamily.schema.js';

const withoutDatabaseId = { _id: 0 } as const;

@Injectable()
export class MongoCatalogRepository extends CatalogRepository {
  constructor(
    @InjectModel(PlantFamilyDocument.name) private readonly familyModel: Model<PlantFamilyDocument>,
    @InjectModel(CropDocument.name) private readonly cropModel: Model<CropDocument>,
    @InjectModel(PestDocument.name) private readonly pestModel: Model<PestDocument>,
  ) {
    super();
  }

  findFamilies(): Promise<PlantFamily[]> {
    return this.familyModel.find({}, withoutDatabaseId).sort({ key: 1 }).lean<PlantFamily[]>().exec();
  }

  findCrops(): Promise<Crop[]> {
    return this.cropModel.find({}, withoutDatabaseId).sort({ key: 1 }).lean<Crop[]>().exec();
  }

  findCropByKey(key: string): Promise<Crop | null> {
    return this.cropModel.findOne({ key }, withoutDatabaseId).lean<Crop>().exec();
  }

  findPests(): Promise<Pest[]> {
    return this.pestModel.find({}, withoutDatabaseId).sort({ key: 1 }).lean<Pest[]>().exec();
  }

  async replaceCatalogEntries(families: PlantFamily[], crops: Crop[], pests: Pest[]): Promise<void> {
    await Promise.all([
      ...families.map((family) => this.familyModel.replaceOne({ key: family.key }, family, { upsert: true }).exec()),
      ...crops.map((crop) => this.cropModel.replaceOne({ key: crop.key }, crop, { upsert: true }).exec()),
      ...pests.map((pest) => this.pestModel.replaceOne({ key: pest.key }, pest, { upsert: true }).exec()),
    ]);
  }
}
