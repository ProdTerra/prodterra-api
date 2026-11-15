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
