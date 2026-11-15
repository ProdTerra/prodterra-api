import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module.js';
import { MongoCatalogRepository } from '../catalog/infrastructure/mongoCatalogRepository.js';
import { demoCrops, demoPests } from '../catalog/seed/demoCatalogData.js';
import { seedFamilies } from '../catalog/seed/catalogSeedData.js';
import { isDemoDatabase } from './demoGuard.js';

const logContext = 'SeedDemoDatabase';

async function seedDemoDatabase(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn', 'log'] });
  try {
    const databaseName = app.get(ConfigService).getOrThrow<string>('DB_NAME');
    if (!isDemoDatabase(databaseName)) {
      Logger.warn(
        `Refusing to load fictitious data into "${databaseName}". Use a DB_NAME such as development, prodterra-dev, test or demo.`,
        logContext,
      );
      process.exitCode = 1;
      return;
    }
    await app.get(MongoCatalogRepository).replaceCatalog(seedFamilies, demoCrops, demoPests);
    Logger.log(
      `Demo catalog loaded into "${databaseName}": ${seedFamilies.length} families, ${demoCrops.length} crops, ${demoPests.length} pests`,
      logContext,
    );
  } finally {
    await app.close();
  }
}

await seedDemoDatabase();
