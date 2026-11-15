import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountsModule } from './accounts/accounts.module.js';
import { FarmsModule } from './farms/farms.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { CatalogModule } from './catalog/catalog.module.js';
import { ClimateModule } from './climate/climate.module.js';
import { validateEnvironment } from './config/environment.js';
import { PlanningModule } from './planning/planning.module.js';
import { TerrainModule } from './terrain/terrain.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('MONGODB_URI'),
        dbName: configService.getOrThrow<string>('DB_NAME'),
      }),
    }),
    TerrainModule,
    ClimateModule,
    CatalogModule,
    PlanningModule,
    AccountsModule,
    FarmsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
