import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TerrainModule } from './terrain/terrain.module.js';

@Module({
  imports: [TerrainModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
