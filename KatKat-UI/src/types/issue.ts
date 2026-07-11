import type { FullAuditedEntityDto } from './common';
import type { IssueStatus } from './enums';

export interface IssueDto extends FullAuditedEntityDto<string> {
  complexId: string;
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
  title: string;
  description?: string;
  photoUrl?: string;
}
