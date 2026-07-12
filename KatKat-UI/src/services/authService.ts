import { jwtDecode } from 'jwt-decode';
import { apiUrl, appConfig } from '../config/appConfig';
import type { AccessTokenClaims } from '../types/auth';
import { clearTokens, getTokens, isExpired, setTokens, type StoredTokens } from './tokenStorage';

const TOKEN_ENDPOINT = `${appConfig.authAuthority}/connect/token`;
const OAUTH_SCOPE = 'KatKat';
const TENANT_QUERY_KEY = '__tenant';

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

// Managers/Residents belong to a Tenant, so the OpenIddict password/refresh grants need a
// tenant hint before any JWT exists to derive it from - ABP's QueryStringTenantResolveContributor
// reads it off this exact query key on any request, including this form-urlencoded POST.
async function resolveTenantId(userName: string): Promise<string | null> {
  try {
    const response = await fetch(apiUrl(`/account/tenant-lookup?userName=${encodeURIComponent(userName)}`));
    if (!response.ok) {
      return null;
    }
    const envelope = (await response.json()) as { data: string | null };
    return envelope.data;
  } catch {
    return null;
  }
}

async function requestToken(body: URLSearchParams, tenantId?: string | null): Promise<StoredTokens> {
  const url = tenantId ? `${TOKEN_ENDPOINT}?${TENANT_QUERY_KEY}=${encodeURIComponent(tenantId)}` : TOKEN_ENDPOINT;
  const response = await fetch(url, {
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

export async function login(username: string, password: string): Promise<StoredTokens> {
  const tenantId = await resolveTenantId(username);
  return requestToken(
    new URLSearchParams({
      grant_type: 'password',
      client_id: appConfig.oauthClientId,
      username,
      password,
      scope: OAUTH_SCOPE,
    }),
    tenantId,
  );
}

export async function refreshAccessToken(): Promise<string | null> {
  const tokens = getTokens();
  if (!tokens?.refreshToken) {
    return null;
  }
  try {
    // The stored access token is expired by now (that's why we're refreshing) but still decodable -
    // its tenantid claim is the same tenant hint the token endpoint needs for this grant too.
    const tenantId = jwtDecode<AccessTokenClaims>(tokens.accessToken).tenantid ?? null;
    const refreshed = await requestToken(
      new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: appConfig.oauthClientId,
        refresh_token: tokens.refreshToken,
      }),
      tenantId,
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
