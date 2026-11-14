import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CatalogService } from './application/catalog.service.js';
import { CatalogRepository } from './domain/catalogRepository.js';
import { MongoCatalogRepository } from './infrastructure/mongoCatalogRepository.js';
import { CropDocument, CropSchema } from './infrastructure/schemas/crop.schema.js';
import { PestDocument, PestSchema } from './infrastructure/schemas/pest.schema.js';
import { PlantFamilyDocument, PlantFamilySchema } from './infrastructure/schemas/plantFamily.schema.js';
import { CatalogController } from './presentation/catalog.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PlantFamilyDocument.name, schema: PlantFamilySchema },
      { name: CropDocument.name, schema: CropSchema },
      { name: PestDocument.name, schema: PestSchema },
    ]),
  ],
  controllers: [CatalogController],
  providers: [CatalogService, MongoCatalogRepository, { provide: CatalogRepository, useExisting: MongoCatalogRepository }],
  exports: [MongoCatalogRepository],
})
export class CatalogModule {}
