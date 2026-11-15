import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { AccountService } from './application/account.service.js';
import { SessionService } from './application/session.service.js';
import { PasswordHasher } from './domain/passwordHasher.js';
import { SessionRepository } from './domain/sessionRepository.js';
import { UserRepository } from './domain/userRepository.js';
import { Argon2PasswordHasher } from './infrastructure/argon2PasswordHasher.js';
import { MongoSessionRepository } from './infrastructure/mongoSessionRepository.js';
import { MongoUserRepository } from './infrastructure/mongoUserRepository.js';
import { SessionDocument, SessionSchema } from './infrastructure/schemas/session.schema.js';
import { UserDocument, UserSchema } from './infrastructure/schemas/user.schema.js';
import { AuthController } from './presentation/auth.controller.js';
import { authenticationThrottlerOptions } from './presentation/authenticationThrottling.js';
import { createSessionCookieSettings, SessionCookieSettings } from './presentation/sessionCookie.js';
import { SessionGuard } from './presentation/sessionGuard.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserDocument.name, schema: UserSchema },
      { name: SessionDocument.name, schema: SessionSchema },
    ]),
    ThrottlerModule.forRoot(authenticationThrottlerOptions),
  ],
  controllers: [AuthController],
  providers: [
    AccountService,
    SessionService,
    SessionGuard,
    { provide: UserRepository, useClass: MongoUserRepository },
    { provide: SessionRepository, useClass: MongoSessionRepository },
    { provide: PasswordHasher, useClass: Argon2PasswordHasher },
    { provide: SessionCookieSettings, inject: [ConfigService], useFactory: createSessionCookieSettings },
  ],
  exports: [SessionService, SessionGuard],
})
export class AccountsModule {}
