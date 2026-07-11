/**
 * Single source of truth for every environment-specific URL. Nothing else in the app should
 * read `import.meta.env` directly - when the production domain changes, only .env.production
 * needs to change (see README / .env.example).
 */

function requireEnv(name: keyof ImportMetaEnv): string {
  const value = import.meta.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.replace(/\/+$/, '');
}

export const appConfig = {
  apiBaseUrl: requireEnv('VITE_API_BASE_URL'),
  authAuthority: requireEnv('VITE_AUTH_AUTHORITY'),
  signalrHubUrl: requireEnv('VITE_SIGNALR_HUB_URL'),
  oauthClientId: requireEnv('VITE_OAUTH_CLIENT_ID'),
} as const;

export const apiRoutePrefix = '/api/katkat';

export function apiUrl(path: string): string {
  return `${appConfig.apiBaseUrl}${apiRoutePrefix}${path}`;
}
