import { appConfig } from '../config/appConfig';
import { clearTokens, getTokens, isExpired, setTokens, type StoredTokens } from './tokenStorage';

const TOKEN_ENDPOINT = `${appConfig.authAuthority}/connect/token`;
const OAUTH_SCOPE = 'KatKat';

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

interface TokenErrorResponse {
  error: string;
  error_description?: string;
}

export class AuthError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

async function requestToken(body: URLSearchParams): Promise<StoredTokens> {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const payload = (await response.json()) as TokenResponse | TokenErrorResponse;

  if (!response.ok || 'error' in payload) {
    const errorPayload = payload as TokenErrorResponse;
    throw new AuthError(errorPayload.error, errorPayload.error_description ?? 'Login failed.');
  }

  const tokens: StoredTokens = {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token ?? null,
    expiresAt: Date.now() + payload.expires_in * 1000,
  };
  setTokens(tokens);
  return tokens;
}

export function login(username: string, password: string): Promise<StoredTokens> {
  return requestToken(
    new URLSearchParams({
      grant_type: 'password',
      client_id: appConfig.oauthClientId,
      username,
      password,
      scope: OAUTH_SCOPE,
    }),
  );
}

export async function refreshAccessToken(): Promise<string | null> {
  const tokens = getTokens();
  if (!tokens?.refreshToken) {
    return null;
  }
  try {
    const refreshed = await requestToken(
      new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: appConfig.oauthClientId,
        refresh_token: tokens.refreshToken,
      }),
    );
    return refreshed.accessToken;
  } catch {
    clearTokens();
    return null;
  }
}

export function logout(): void {
  clearTokens();
}

export function getValidAccessToken(): string | null {
  const tokens = getTokens();
  if (!tokens || isExpired(tokens)) {
    return null;
  }
  return tokens.accessToken;
}

export function isAuthenticated(): boolean {
  const tokens = getTokens();
  return !!tokens && !isExpired(tokens);
}
