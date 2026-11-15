import { isEmail } from 'class-validator';

export type CredentialField = 'name' | 'email' | 'password';

export type FieldErrorCode =
  | 'nameRequired'
  | 'nameTooLong'
  | 'invalidEmail'
  | 'passwordRequired'
  | 'passwordTooShort'
  | 'passwordTooLong';

export type FieldError = { field: CredentialField; code: FieldErrorCode };

export type RegistrationInput = { name: string; email: string; password: string };

export type LoginInput = { email: string; password: string };

export type ValidationResult<Input> = { isValid: true; input: Input } | { isValid: false; errors: FieldError[] };

export const nameMaximumLength = 80;
export const emailMaximumLength = 254;
export const passwordMinimumLength = 8;
export const passwordMaximumLength = 128;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateRegistration(body: unknown): ValidationResult<RegistrationInput> {
  const fields = readFields(body);
  const input = { name: fields.name.trim(), email: normalizeEmail(fields.email), password: fields.password };
  const errors = [...validateName(input.name), ...validateEmail(input.email), ...validateNewPassword(input.password)];
  return toResult(input, errors);
}

export function validateLogin(body: unknown): ValidationResult<LoginInput> {
  const fields = readFields(body);
  const input = { email: normalizeEmail(fields.email), password: fields.password };
  const errors = [...validateEmail(input.email), ...validateLoginPassword(input.password)];
  return toResult(input, errors);
}

function readFields(body: unknown): Record<CredentialField, string> {
  const source = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
  return { name: readString(source.name), email: readString(source.email), password: readString(source.password) };
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function validateName(name: string): FieldError[] {
  if (name.length === 0) return [{ field: 'name', code: 'nameRequired' }];
  if (name.length > nameMaximumLength) return [{ field: 'name', code: 'nameTooLong' }];
  return [];
}

function validateEmail(email: string): FieldError[] {
  const isValidEmail = email.length <= emailMaximumLength && isEmail(email);
  return isValidEmail ? [] : [{ field: 'email', code: 'invalidEmail' }];
}

function validateNewPassword(password: string): FieldError[] {
  if (password.length < passwordMinimumLength) return [{ field: 'password', code: 'passwordTooShort' }];
  if (password.length > passwordMaximumLength) return [{ field: 'password', code: 'passwordTooLong' }];
  return [];
}

function validateLoginPassword(password: string): FieldError[] {
  if (password.length === 0) return [{ field: 'password', code: 'passwordRequired' }];
  if (password.length > passwordMaximumLength) return [{ field: 'password', code: 'passwordTooLong' }];
  return [];
}

function toResult<Input>(input: Input, errors: FieldError[]): ValidationResult<Input> {
  return errors.length === 0 ? { isValid: true, input } : { isValid: false, errors };
}
