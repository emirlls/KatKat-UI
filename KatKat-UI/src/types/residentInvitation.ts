import type { FullAuditedEntityDto } from './common';

export interface ResidentInvitationDto extends FullAuditedEntityDto<string> {
  flatId: string;
  code: string;
  expiresAt: string;
  redeemedAt?: string;
}

export interface CreateResidentInvitationDto {
  flatId: string;
}

export interface RedeemResidentInvitationDto {
  code: string;
  userName: string;
  email: string;
  phoneNumber: string;
  password: string;
}
