import { api } from '../../../services/api';
import type { CreateResidentInvitationDto, RedeemResidentInvitationDto, ResidentInvitationDto } from '../../../types/residentInvitation';

export const residentInvitationService = {
  create: (input: CreateResidentInvitationDto) => api.post<ResidentInvitationDto>('/resident-invitations', input),
  redeem: (input: RedeemResidentInvitationDto) => api.post<void>('/resident-invitations/redeem', input),
};
