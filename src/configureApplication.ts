import { type INestApplication, ValidationPipe } from '@nestjs/common';

const defaultWebOrigin = 'http://localhost:3000';

export function configureApplication(app: INestApplication): void {
  app.enableCors({ origin: process.env.WEB_ORIGIN ?? defaultWebOrigin });
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
}
