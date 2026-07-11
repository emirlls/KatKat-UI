import { api } from '../../../services/api';
import type { CreateP2PRequestDto, P2PRequestDto } from '../../../types/p2pRequest';
import type { P2PRequestStatus } from '../../../types/enums';

export const p2pRequestService = {
  listByComplex: (complexId: string, status?: P2PRequestStatus) =>
    api.get<P2PRequestDto[]>('/p2p-requests', { complexId, status }),
  create: (input: CreateP2PRequestDto) => api.post<P2PRequestDto>('/p2p-requests', input),
  fulfill: (id: string) => api.post<P2PRequestDto>(`/p2p-requests/${id}/fulfill`),
  cancel: (id: string) => api.post<P2PRequestDto>(`/p2p-requests/${id}/cancel`),
};
