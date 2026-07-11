import type { FullAuditedEntityDto } from './common';
import type { FlatMemberRole } from './enums';

export interface BuildingDto extends FullAuditedEntityDto<string> {
  complexId: string;
  name: string;
  floorCount?: number;
}

export interface CreateBuildingDto {
  complexId: string;
  name: string;
  floorCount?: number;
}

export interface FlatDto extends FullAuditedEntityDto<string> {
  buildingId: string;
  flatNumber: string;
  floorNumber?: number;
  shareFactor: number;
}

export interface CreateFlatDto {
  buildingId: string;
  flatNumber: string;
  floorNumber?: number;
  shareFactor: number;
}

export interface UpdateFlatDto {
  flatNumber: string;
  floorNumber?: number;
  shareFactor: number;
}

export interface FlatMemberDto extends FullAuditedEntityDto<string> {
  flatId: string;
  userId: string;
  role: FlatMemberRole;
}

export interface InviteFlatMemberDto {
  flatId: string;
}
