import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { parseAllowedOrigins } from './config/allowedOrigins.js';

export function configureApplication(app: INestApplication): void {
  app.enableCors({ origin: parseAllowedOrigins(process.env.WEB_ORIGIN), credentials: true });
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
}
