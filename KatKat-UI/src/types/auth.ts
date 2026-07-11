export interface AuthUser {
  id: string;
  userName: string;
  roles: string[];
}

export interface AccessTokenClaims {
  sub: string;
  preferred_username?: string;
  role?: string | string[];
  exp: number;
}

export interface RegisterDto {
  userName: string;
  email: string;
  password: string;
  isManager: boolean;
}
