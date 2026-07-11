import type { FullAuditedEntityDto } from './common';
import type { SosStatus } from './enums';

export interface SosAlertDto extends FullAuditedEntityDto<string> {
  complexId: string;
  flatId: string;
  flatNumber: string;
  reporterUserId: string;
  status: SosStatus;
  resolvedAt?: string;
  resolvedByUserId?: string;
}

export interface ReportSosAlertDto {
  complexId: string;
  flatId: string;
  status: SosStatus;
}
