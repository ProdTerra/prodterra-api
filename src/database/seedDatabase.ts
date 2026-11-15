import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module.js';
import { MongoCatalogRepository } from '../catalog/infrastructure/mongoCatalogRepository.js';
import { seedCrops, seedFamilies } from '../catalog/seed/catalogSeedData.js';

async function seedDatabase(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn', 'log'] });
  try {
    await app.get(MongoCatalogRepository).replaceCatalog(seedFamilies, seedCrops, []);
    Logger.log(`Catalog loaded: ${seedFamilies.length} families, ${seedCrops.length} crops, 0 pests`, 'SeedDatabase');
  } finally {
    await app.close();
  }
}

await seedDatabase();
