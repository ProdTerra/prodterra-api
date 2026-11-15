export class DuplicateEmailError extends Error {
  constructor() {
    super('An account with this email already exists');
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Email or password is incorrect');
  }
}

export class InvalidPasswordResetError extends Error {
  constructor() {
    super('The password reset link is invalid or expired');
  }
}

export class UnverifiedGoogleEmailError extends Error {
  constructor() {
    super('Google did not verify this email address');
  }
}
