import type { FullAuditedEntityDto, LookupDto } from './common';

export interface ComplexDto extends FullAuditedEntityDto<string> {
  name: string;
  city: LookupDto;
  district: LookupDto;
  neighborhood: LookupDto;
  address?: string;
  latitude: number;
  longitude: number;
  subscriptionStartDate: string;
  subscriptionEndDate?: string;
}

export interface CreateComplexDto {
  name: string;
  neighborhoodId: number;
  address?: string;
  latitude: number;
  longitude: number;
  subscriptionStartDate: string;
}

export interface UpdateComplexDto {
  name: string;
  neighborhoodId: number;
  address?: string;
  latitude: number;
  longitude: number;
}

export interface ExtendComplexSubscriptionDto {
  newEndDate: string;
}

export interface LeaderboardDto {
  rank: number;
  complexId: string;
  complexName: string;
  city: LookupDto;
  district: LookupDto;
  neighborhood: LookupDto;
  latitude: number;
  longitude: number;
  score: number;
  calculatedAt: string;
  distanceKm?: number;
}

export interface DistrictLeaderboardDto {
  district: LookupDto;
  entries: LeaderboardDto[];
}

export interface NeighborhoodLeaderboardDto {
  district: LookupDto;
  neighborhood: LookupDto;
  entries: LeaderboardDto[];
}

/** Admin-only cross-tenant view of a Complex - the same fields, plus the owning Tenant id. */
export interface AdminComplexListItemDto {
  complex: ComplexDto;
  tenantId?: string;
}
