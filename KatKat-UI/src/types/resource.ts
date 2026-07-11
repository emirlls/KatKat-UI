import type { FullAuditedEntityDto } from './common';
import type { ReservationStatus, ResourceType } from './enums';

export interface ResourceDto extends FullAuditedEntityDto<string> {
  complexId: string;
  name: string;
  type: ResourceType;
}

export interface CreateResourceDto {
  complexId: string;
  name: string;
  type: ResourceType;
}

export interface ResourceReservationDto extends FullAuditedEntityDto<string> {
  resourceId: string;
  reservedByUserId: string;
  startTime: string;
  endTime: string;
  status: ReservationStatus;
}

export interface CreateResourceReservationDto {
  resourceId: string;
  startTime: string;
  endTime: string;
}
