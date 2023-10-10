export const errorMessages: Record<string, string> = {
  ValidationError: "Invalid data, check your data and try again",
  InvalidCredentials: "Invalid credentials, check your data and try again",
  UserNotFound: "User not found",
  InvalidAuthProvider: "Invalid auth provider. This account was created with a different auth method",
  EmailNotVerified: "Email not verified",
  TotpCodeRequired: "TOTP code required to login",
  InvalidTotpCode: "Invalid TOTP code. Check your code and try again",
  GenericError: "Something went wrong, try again later",
};

export const GenericError = "GenericError";

export function getErrorMessage(error: string | null, fallbackMessage?: string) {
  if (!error) return fallbackMessage || GenericError;
  return errorMessages[error] || fallbackMessage || GenericError;
}

