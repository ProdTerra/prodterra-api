export type GoogleProfile = {
  googleId: string;
  email: string;
  isEmailVerified: boolean;
  name: string;
};

export type GoogleAuthorizationRequest = {
  state: string;
  codeChallenge: string;
};

export abstract class GoogleIdentityProvider {
  abstract isConfigured(): boolean;
  abstract authorizationUrl(request: GoogleAuthorizationRequest): string;
  abstract profileFromCode(code: string, codeVerifier: string): Promise<GoogleProfile>;
}
