import type { FullAuditedEntityDto } from './common';
import type { IssueStatus } from './enums';

export interface IssueDto extends FullAuditedEntityDto<string> {
  complexId: string;
  buildingId?: string;
  /** Denormalized from Building.Name - which block the fault is in. */
  buildingName?: string;
  reporterUserId: string;
  title: string;
  description?: string;
  photoUrl?: string;
  statuses: IssueStatus;
  resolvedAt?: string;
  resolvedByUserId?: string;
}

export interface CreateIssueDto {
  complexId: string;
  buildingId?: string;
  title: string;
  description?: string;
  photoUrl?: string;
}
