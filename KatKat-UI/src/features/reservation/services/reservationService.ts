import { api } from '../../../services/api';
import type { CreateResourceReservationDto, ResourceReservationDto } from '../../../types/resource';

export const reservationService = {
  listByResource: (resourceId: string) => api.get<ResourceReservationDto[]>('/resource-reservations', { resourceId }),
  create: (input: CreateResourceReservationDto) => api.post<ResourceReservationDto>('/resource-reservations', input),
  approve: (id: string) => api.post<ResourceReservationDto>(`/resource-reservations/${id}/approve`),
  reject: (id: string) => api.post<ResourceReservationDto>(`/resource-reservations/${id}/reject`),
  cancel: (id: string) => api.post<ResourceReservationDto>(`/resource-reservations/${id}/cancel`),
};
