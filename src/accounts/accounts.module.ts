import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { AccountMailer } from './application/accountMailer.js';
import { AccountService } from './application/account.service.js';
import { PasswordResetService } from './application/passwordReset.service.js';
import { SessionService } from './application/session.service.js';
import { WebAppSettings } from './application/webAppSettings.js';
import { GoogleIdentityProvider } from './domain/googleIdentityProvider.js';
import { MailSender } from './domain/mailSender.js';
import { PasswordHasher } from './domain/passwordHasher.js';
import { PasswordResetRepository } from './domain/passwordResetRepository.js';
import { SessionRepository } from './domain/sessionRepository.js';
import { UserRepository } from './domain/userRepository.js';
import { Argon2PasswordHasher } from './infrastructure/argon2PasswordHasher.js';
import { createMailSender } from './infrastructure/createMailSender.js';
import { createGoogleIdentityProvider } from './infrastructure/googleOAuthIdentityProvider.js';
import { MongoPasswordResetRepository } from './infrastructure/mongoPasswordResetRepository.js';
import { MongoSessionRepository } from './infrastructure/mongoSessionRepository.js';
import { MongoUserRepository } from './infrastructure/mongoUserRepository.js';
import { PasswordResetDocument, PasswordResetSchema } from './infrastructure/schemas/passwordReset.schema.js';
import { SessionDocument, SessionSchema } from './infrastructure/schemas/session.schema.js';
import { UserDocument, UserSchema } from './infrastructure/schemas/user.schema.js';
import { AuthController } from './presentation/auth.controller.js';
import { GoogleAuthController } from './presentation/googleAuth.controller.js';
import { authenticationThrottlerOptions } from './presentation/authenticationThrottling.js';
import { createSessionCookieSettings, SessionCookieSettings } from './presentation/sessionCookie.js';
import { SessionGuard } from './presentation/sessionGuard.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserDocument.name, schema: UserSchema },
      { name: SessionDocument.name, schema: SessionSchema },
      { name: PasswordResetDocument.name, schema: PasswordResetSchema },
    ]),
    ThrottlerModule.forRoot(authenticationThrottlerOptions),
  ],
  controllers: [AuthController, GoogleAuthController],
  providers: [
    AccountService,
    AccountMailer,
    PasswordResetService,
    SessionService,
    SessionGuard,
    { provide: UserRepository, useClass: MongoUserRepository },
    { provide: SessionRepository, useClass: MongoSessionRepository },
    { provide: PasswordHasher, useClass: Argon2PasswordHasher },
    { provide: PasswordResetRepository, useClass: MongoPasswordResetRepository },
    { provide: MailSender, inject: [ConfigService], useFactory: createMailSender },
    { provide: GoogleIdentityProvider, inject: [ConfigService], useFactory: createGoogleIdentityProvider },
    {
      provide: WebAppSettings,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        new WebAppSettings(configService.get<string>('WEB_APP_URL') || 'http://localhost:3000'),
    },
    { provide: SessionCookieSettings, inject: [ConfigService], useFactory: createSessionCookieSettings },
  ],
  exports: [SessionService, SessionGuard],
})
export class AccountsModule {}
