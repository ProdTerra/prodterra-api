import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountsModule } from '../accounts/accounts.module.js';
import { SavedFarmRepository } from './domain/savedFarmRepository.js';
import { MongoSavedFarmRepository } from './infrastructure/mongoSavedFarmRepository.js';
import { SavedFarmDocument, SavedFarmSchema } from './infrastructure/schemas/savedFarm.schema.js';
import { FarmsController } from './presentation/farms.controller.js';

@Module({
  imports: [AccountsModule, MongooseModule.forFeature([{ name: SavedFarmDocument.name, schema: SavedFarmSchema }])],
  controllers: [FarmsController],
  providers: [{ provide: SavedFarmRepository, useClass: MongoSavedFarmRepository }],
})
export class FarmsModule {}
