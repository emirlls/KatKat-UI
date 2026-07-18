import { api } from '../../../services/api';
import type {
  CreateResourceReservationDto,
  RejectResourceReservationDto,
  ResourceReservationDto,
} from '../../../types/resource';

export const reservationService = {
  listByResource: (resourceId: string) => api.get<ResourceReservationDto[]>('/resource-reservations', { resourceId }),
  create: (input: CreateResourceReservationDto) => api.post<ResourceReservationDto>('/resource-reservations', input),
  approve: (id: string) => api.post<ResourceReservationDto>(`/resource-reservations/${id}/approve`),
  reject: (id: string, input: RejectResourceReservationDto) =>
    api.post<ResourceReservationDto>(`/resource-reservations/${id}/reject`, input),
  cancel: (id: string) => api.post<ResourceReservationDto>(`/resource-reservations/${id}/cancel`),
};
