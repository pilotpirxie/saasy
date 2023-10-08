export function redirectWithCode({
  callbackUrl,
  code,
}: {
  callbackUrl: string;
  code: string;
}) {
  const urlToRedirect = new URL(callbackUrl);
  urlToRedirect.searchParams.append("code", code);
  return urlToRedirect.toString();
}

export function redirectWithError({
  callbackUrl,
  error,
}: {
  callbackUrl: string;
  error: string;
}) {
  const urlToRedirect = new URL(callbackUrl);
  urlToRedirect.searchParams.append("error", error);
  return urlToRedirect.toString();
}
