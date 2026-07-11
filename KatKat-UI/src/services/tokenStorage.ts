const STORAGE_KEY = 'katkat.auth.tokens';

export interface StoredTokens {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: number;
}

export function getTokens(): StoredTokens | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as StoredTokens;
  } catch {
    return null;
  }
}

export function setTokens(tokens: StoredTokens): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
}

export function clearTokens(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function isExpired(tokens: StoredTokens): boolean {
  return Date.now() >= tokens.expiresAt;
}
