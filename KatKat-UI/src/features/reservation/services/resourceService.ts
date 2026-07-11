import { api } from '../../../services/api';
import type { CreateResourceDto, ResourceDto } from '../../../types/resource';

export const resourceService = {
  listByComplex: (complexId: string) => api.get<ResourceDto[]>('/resources', { complexId }),
  create: (input: CreateResourceDto) => api.post<ResourceDto>('/resources', input),
};
