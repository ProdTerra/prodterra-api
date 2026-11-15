import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { getConnectionToken } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import { AppModule } from '../app.module.js';
import { isCleanConfirmed } from './cleanConfirmation.js';

const logContext = 'CleanDatabase';

async function cleanDatabase(): Promise<void> {
  if (!isCleanConfirmed(process.argv)) {
    Logger.warn('Nothing was deleted. Run it again with --confirm to drop the whole database.', logContext);
    process.exitCode = 1;
    return;
  }
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn', 'log'] });
  try {
    const connection = app.get<Connection>(getConnectionToken());
    const databaseName = connection.db?.databaseName ?? 'unknown';
    await connection.dropDatabase();
    Logger.log(`Database "${databaseName}" dropped`, logContext);
  } finally {
    await app.close();
  }
}

await cleanDatabase();
