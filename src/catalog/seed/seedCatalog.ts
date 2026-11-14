import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module.js';
import { MongoCatalogRepository } from '../infrastructure/mongoCatalogRepository.js';
import { seedCrops, seedFamilies } from './catalogSeedData.js';

async function seedCatalog(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn', 'log'] });
  try {
    await app.get(MongoCatalogRepository).replaceCatalogEntries(seedFamilies, seedCrops, []);
    Logger.log(`Catalog seeded: ${seedFamilies.length} families, ${seedCrops.length} crops`, 'SeedCatalog');
  } finally {
    await app.close();
  }
}

await seedCatalog();
