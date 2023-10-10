export const errorMessages: Record<string, string> = {
  ValidationError: "Invalid data, check your data and try again",
  InvalidCredentials: "Invalid credentials, check your data and try again",
  UserNotFound: "User not found",
  InvalidAuthProvider: "Invalid auth provider. This account was created with a different auth method",
  EmailNotVerified: "Email not verified",
  TotpCodeRequired: "TOTP code required to login",
  InvalidTotpCode: "Invalid TOTP code. Check your code and try again",
};

export const genericErrorMessage = "Something went wrong, please try again later";