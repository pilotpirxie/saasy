import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";

export const errorMessages: Record<string, string> = {
  ValidationError: "Invalid data, check your data and try again",
  InvalidCredentials: "Invalid credentials, check your data and try again",
  UserNotFound: "User not found",
  InvalidAuthProvider: "Invalid auth provider. This account was created with a different auth method",
  EmailNotVerified: "Email not verified",
  TotpCodeRequired: "TOTP code required to login",
  InvalidTotpCode: "Invalid TOTP code. Check your code and try again",
  GenericError: "Something went wrong, try again later",
  UserAlreadyExists: "User already exists. If you already have an account, try logging in",
  PasswordResetNotFound: "Password reset code not found",
  CannotAssignRoleToSelf: "Cannot assign role to self",
  MissingAuthorizationHeader: "Missing authorization header",
  ForbiddenNotInTeam: "Forbidden, you are not in this team",
  ForbiddenRole: "Forbidden, you don't have the required role",
  MissingTeamId: "Missing team id",
  MissingUserId: "Missing user id",
  EmailAlreadyExists: "Email already exists",
  SameEmail: "New email cannot be the same as the old one",
  InvalidRefreshToken: "Invalid refresh token",
  VerificationCodeNotFound: "Verification code not found",
  EmailAlreadyInUse: "Email already in use",
  PasswordResetExpired: "Password reset has expired",
  SessionNotFound: "Session not found",
  SessionRevoked: "Session has been revoked",
  AuthorizationCodeNotFound: "Authorization code not found",
  AuthorizationCodeExpired: "Authorization code expired",
  VerificationCodeExpired: "Verification code expired. Please refresh the page and try again",
  TooFastResend: "You just requested a verification email. Please wait a few minutes before trying again",
  UserAlreadyInTeam: "User already in team",
  UserAlreadyInvited: "User already invited",
};

export const GenericError = "GenericError";

export function getErrorMessage(error: string | null, fallbackMessage?: string) {
  if (!error) return fallbackMessage || errorMessages[GenericError];
  return errorMessages[error] || fallbackMessage || errorMessages[GenericError];
}

export function getErrorRTKQuery(error: FetchBaseQueryError | SerializedError | undefined): string {
  if (!error) return errorMessages[GenericError];
  if ("status" in error) {
    const errorData = error.data as { error: string; message: string, timestamp: string };
    return errorData.error || GenericError;
  }

  return GenericError;
}