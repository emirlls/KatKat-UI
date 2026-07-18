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
  flatId?: string;
  /** Denormalized from Flat.FlatNumber - which flat the reserver lives in. */
  flatNumber?: string;
  buildingId?: string;
  /** Denormalized from Building.Name - which block the reserver lives in. */
  buildingName?: string;
  reservedByUserId: string;
  startTime: string;
  endTime: string;
  status: ReservationStatus;
  rejectionReason?: string;
}

export interface CreateResourceReservationDto {
  resourceId: string;
  startTime: string;
  endTime: string;
}

export interface RejectResourceReservationDto {
  reason: string;
}
