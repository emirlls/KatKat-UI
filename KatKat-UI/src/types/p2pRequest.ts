import type { FullAuditedEntityDto } from './common';
import type { P2PRequestStatus } from './enums';

export interface P2PRequestDto extends FullAuditedEntityDto<string> {
  complexId: string;
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
