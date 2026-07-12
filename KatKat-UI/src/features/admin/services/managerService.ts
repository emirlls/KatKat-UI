import { api } from '../../../services/api';
import type { CreateManagerDto, ManagerListItemDto, UpdateManagerDto } from '../../../types/admin';

export interface ManagerSearchParams {
  cityId?: number;
  districtId?: number;
  neighborhoodId?: number;
  name?: string;
  maxResultCount?: number;
  [key: string]: unknown;
}

export const managerService = {
  create: (input: CreateManagerDto) => api.post<void>('/account/managers', input),
  list: (params: ManagerSearchParams) => api.get<ManagerListItemDto[]>('/account/managers', params),
  update: (tenantId: string, input: UpdateManagerDto) =>
    api.put<ManagerListItemDto>(`/account/managers/${tenantId}`, input),
};
