import type { ConfigService } from '@nestjs/config';
import {
  GoogleIdentityProvider,
  type GoogleAuthorizationRequest,
  type GoogleProfile,
} from '../domain/googleIdentityProvider.js';

const authorizationEndpoint = 'https://accounts.google.com/o/oauth2/v2/auth';
const tokenEndpoint = 'https://oauth2.googleapis.com/token';
const userInfoEndpoint = 'https://openidconnect.googleapis.com/v1/userinfo';

type GoogleCredentials = { clientId: string; clientSecret: string; callbackUrl: string };

type UserInfoResponse = { sub?: unknown; email?: unknown; email_verified?: unknown; name?: unknown };

export class GoogleOAuthIdentityProvider extends GoogleIdentityProvider {
  constructor(private readonly credentials: GoogleCredentials | null) {
    super();
  }

  isConfigured(): boolean {
    return this.credentials !== null;
  }

  authorizationUrl({ state, codeChallenge }: GoogleAuthorizationRequest): string {
    const credentials = this.requireCredentials();
    const parameters = new URLSearchParams({
      client_id: credentials.clientId,
      redirect_uri: credentials.callbackUrl,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      prompt: 'select_account',
    });
    return `${authorizationEndpoint}?${parameters.toString()}`;
  }

  async profileFromCode(code: string, codeVerifier: string): Promise<GoogleProfile> {
    const accessToken = await this.exchangeCode(code, codeVerifier);
    const response = await fetch(userInfoEndpoint, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (!response.ok) {
      throw new Error(`Google user info failed with status ${response.status}`);
    }
    const userInfo = (await response.json()) as UserInfoResponse;
    if (typeof userInfo.sub !== 'string' || typeof userInfo.email !== 'string') {
      throw new Error('Google user info has no subject or email');
    }
    return {
      googleId: userInfo.sub,
      email: userInfo.email,
      isEmailVerified: userInfo.email_verified === true,
      name: typeof userInfo.name === 'string' ? userInfo.name : '',
    };
  }

  private async exchangeCode(code: string, codeVerifier: string): Promise<string> {
    const credentials = this.requireCredentials();
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        code_verifier: codeVerifier,
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
        redirect_uri: credentials.callbackUrl,
        grant_type: 'authorization_code',
      }),
    });
    if (!response.ok) {
      throw new Error(`Google token exchange failed with status ${response.status}`);
    }
    const body = (await response.json()) as { access_token?: unknown };
    if (typeof body.access_token !== 'string') {
      throw new Error('Google token response has no access token');
    }
    return body.access_token;
  }

  private requireCredentials(): GoogleCredentials {
    if (!this.credentials) {
      throw new Error('Google sign in is not configured');
    }
    return this.credentials;
  }
}

export function createGoogleIdentityProvider(configService: ConfigService): GoogleIdentityProvider {
  const clientId = configService.get<string>('GOOGLE_CLIENT_ID');
  const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
  const callbackUrl = configService.get<string>('GOOGLE_CALLBACK_URL');
  return new GoogleOAuthIdentityProvider(clientId && clientSecret && callbackUrl ? { clientId, clientSecret, callbackUrl } : null);
}
