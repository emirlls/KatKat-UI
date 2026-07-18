import type { FullAuditedEntityDto } from './common';
import type { P2PRequestStatus } from './enums';

export interface P2PRequestDto extends FullAuditedEntityDto<string> {
  complexId: string;
  flatId?: string;
  /** Denormalized from Flat.FlatNumber - which flat the requester lives in. */
  flatNumber?: string;
  buildingId?: string;
  /** Denormalized from Building.Name - which block the requester lives in. */
  buildingName?: string;
  requesterUserId: string;
  title: string;
  description?: string;
  neededUntil?: string;
  status: P2PRequestStatus;
  fulfilledByUserId?: string;
  fulfilledAt?: string;
}

export interface CreateP2PRequestDto {
  complexId: string;
  title: string;
  description?: string;
  neededUntil?: string;
}
