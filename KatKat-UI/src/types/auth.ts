export interface AuthUser {
  id: string;
  userName: string;
  roles: string[];
}

export interface AccessTokenClaims {
  sub: string;
  preferred_username?: string;
  role?: string | string[];
  tenantid?: string;
  exp: number;
}
